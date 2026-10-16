import os
import shutil
import zipfile
import base64
import hashlib
import struct
import subprocess

def rebuild():
    print("=== Rebuilding Kavya AI Stories APK (v1.1.0 / versionCode 2) ===")
    
    # 1. Base files from existing template
    template_apk = 'build-apk/bin/app-aligned.apk'
    if not os.path.exists(template_apk):
        template_apk = 'app-release.apk'
    
    z_in = zipfile.ZipFile(template_apk, 'r')
    
    work_dir = '/tmp/apk_work'
    if os.path.exists(work_dir):
        shutil.rmtree(work_dir)
    os.makedirs(work_dir, exist_ok=True)
    
    # Extract non-meta files
    for item in z_in.infolist():
        if item.filename.startswith('META-INF/'):
            continue
        z_in.extract(item, work_dir)
    z_in.close()
    
    # 2. Update binary AndroidManifest.xml: versionCode=2, versionName="1.1.0"
    manifest_path = os.path.join(work_dir, 'AndroidManifest.xml')
    with open(manifest_path, 'rb') as f:
        m_data = bytearray(f.read())
    
    # Update versionName string "1.0.0" -> "1.1.0" in UTF-16LE
    old_vn = '1.0.0'.encode('utf-16le')
    new_vn = '1.1.0'.encode('utf-16le')
    if old_vn in m_data:
        idx = m_data.index(old_vn)
        m_data[idx:idx+len(new_vn)] = new_vn
        print(f"Updated versionName string at offset {idx} to 1.1.0")
    else:
        print("Warning: old versionName not found in UTF-16LE")

    # Update versionCode: search for pattern of versionCode attribute
    # In manifest tag: uri=15, name=0 (versionCode), val=-1, type=0x10000008, data=1
    # We locate offset 1448 or search dynamically
    vc_found = False
    for pos in range(100, len(m_data) - 20, 4):
        u_idx, n_idx, v_idx, attr_type, attr_data = struct.unpack_from('<IIIII', m_data, pos)
        if n_idx == 0 and attr_type == 0x10000008 and attr_data == 1:
            struct.pack_into('<I', m_data, pos + 16, 2)
            print(f"Updated versionCode at offset {pos+16} from 1 to 2")
            vc_found = True
            break
            
    if not vc_found:
        print("Warning: versionCode attribute pattern not matched dynamically, checking offset 1464")
        if struct.unpack_from('<I', m_data, 1464)[0] == 1:
            struct.pack_into('<I', m_data, 1464, 2)
            print("Updated versionCode at offset 1464 from 1 to 2")

    with open(manifest_path, 'wb') as f:
        f.write(m_data)
        
    # 3. Replace assets/www with latest dist/ build
    www_dir = os.path.join(work_dir, 'assets', 'www')
    if os.path.exists(www_dir):
        shutil.rmtree(www_dir)
    os.makedirs(www_dir, exist_ok=True)
    
    dist_dir = 'dist'
    for root, dirs, files in os.walk(dist_dir):
        rel_root = os.path.relpath(root, dist_dir)
        target_sub = www_dir if rel_root == '.' else os.path.join(www_dir, rel_root)
        os.makedirs(target_sub, exist_ok=True)
        for file in files:
            src_f = os.path.join(root, file)
            dst_f = os.path.join(target_sub, file)
            shutil.copy2(src_f, dst_f)
            
    # Also ensure public icons and manifest are in www
    for extra in ['icon-192.png', 'icon-512.png', 'icon.svg', 'manifest.webmanifest']:
        p_extra = os.path.join('public', extra)
        if os.path.exists(p_extra):
            shutil.copy2(p_extra, os.path.join(www_dir, extra))
            
    print(f"Copied fresh dist files into {www_dir}")
    
    # 4. Generate META-INF/MANIFEST.MF
    all_files = []
    for root, dirs, files in os.walk(work_dir):
        for file in files:
            full_p = os.path.join(root, file)
            rel_p = os.path.relpath(full_p, work_dir).replace('\\', '/')
            all_files.append(rel_p)
    all_files.sort()
    
    manifest_lines = [
        "Manifest-Version: 1.0",
        "Created-By: 1.0 (Android)",
        ""
    ]
    
    manifest_entry_digests = {}
    
    for rel_p in all_files:
        full_p = os.path.join(work_dir, rel_p)
        with open(full_p, 'rb') as f:
            content = f.read()
        sha1_d = base64.b64encode(hashlib.sha1(content).digest()).decode('ascii')
        sha256_d = base64.b64encode(hashlib.sha256(content).digest()).decode('ascii')
        
        manifest_lines.append(f"Name: {rel_p}")
        manifest_lines.append(f"SHA-256-Digest: {sha256_d}")
        manifest_lines.append(f"SHA1-Digest: {sha1_d}")
        manifest_lines.append("")
        
        # Digest of the entry in MANIFEST.MF for SF file
        entry_text = f"Name: {rel_p}\r\nSHA-256-Digest: {sha256_d}\r\nSHA1-Digest: {sha1_d}\r\n\r\n".encode('utf-8')
        manifest_entry_digests[rel_p] = {
            'sha1': base64.b64encode(hashlib.sha1(entry_text).digest()).decode('ascii'),
            'sha256': base64.b64encode(hashlib.sha256(entry_text).digest()).decode('ascii'),
        }
        
    manifest_content = "\r\n".join(manifest_lines).encode('utf-8')
    meta_dir = os.path.join(work_dir, 'META-INF')
    os.makedirs(meta_dir, exist_ok=True)
    
    with open(os.path.join(meta_dir, 'MANIFEST.MF'), 'wb') as f:
        f.write(manifest_content)
        
    # 5. Generate META-INF/KAVYA.SF
    sf_lines = [
        "Signature-Version: 1.0",
        "Created-By: 1.0 (Android)",
        f"SHA-256-Digest-Manifest: {base64.b64encode(hashlib.sha256(manifest_content).digest()).decode('ascii')}",
        f"SHA1-Digest-Manifest: {base64.b64encode(hashlib.sha1(manifest_content).digest()).decode('ascii')}",
        ""
    ]
    for rel_p in all_files:
        sf_lines.append(f"Name: {rel_p}")
        sf_lines.append(f"SHA-256-Digest: {manifest_entry_digests[rel_p]['sha256']}")
        sf_lines.append(f"SHA1-Digest: {manifest_entry_digests[rel_p]['sha1']}")
        sf_lines.append("")
        
    sf_content = "\r\n".join(sf_lines).encode('utf-8')
    sf_path = os.path.join(meta_dir, 'KAVYA.SF')
    with open(sf_path, 'wb') as f:
        f.write(sf_content)
        
    # 6. Generate META-INF/KAVYA.RSA using openssl smime with release.pem
    rsa_path = os.path.join(meta_dir, 'KAVYA.RSA')
    pem_path = 'build-apk/release.pem'
    if not os.path.exists(pem_path):
        pem_path = '/tmp/release.pem'
    
    cmd = [
        'openssl', 'smime', '-sign',
        '-in', sf_path,
        '-out', rsa_path,
        '-outform', 'DER',
        '-signer', pem_path,
        '-inkey', pem_path,
        '-noattr',
        '-binary'
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"openssl smime error: {res.stderr}")
    print("Generated signature META-INF/KAVYA.RSA")
    
    # 7. Package ZIP file into app-release.apk
    output_apks = [
        'app-release.apk',
        'public/app-release.apk',
        'build-apk/bin/app-release.apk'
    ]
    
    for out_apk in output_apks:
        os.makedirs(os.path.dirname(os.path.abspath(out_apk)), exist_ok=True)
        if os.path.exists(out_apk):
            os.remove(out_apk)
            
        with zipfile.ZipFile(out_apk, 'w', zipfile.ZIP_DEFLATED) as z_out:
            # First write MANIFEST.MF, KAVYA.SF, KAVYA.RSA
            for m_file in ['MANIFEST.MF', 'KAVYA.SF', 'KAVYA.RSA']:
                z_out.write(os.path.join(meta_dir, m_file), f'META-INF/{m_file}')
            # Next write AndroidManifest.xml
            z_out.write(manifest_path, 'AndroidManifest.xml')
            # Write all other files
            for rel_p in all_files:
                if rel_p == 'AndroidManifest.xml':
                    continue
                z_out.write(os.path.join(work_dir, rel_p), rel_p)
                
        apk_size = os.path.getsize(out_apk)
        print(f"Generated {out_apk} ({apk_size} bytes, {apk_size/1024:.1f} KB)")
        
    print("\nSUCCESS: All release APKs successfully rebuilt with versionCode 2 and versionName 1.1.0!")

if __name__ == '__main__':
    rebuild()
