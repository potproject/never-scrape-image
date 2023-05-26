const password = "G<pt%N{tNL5A[*)tprRrL$++?h>tA4F3={]h(?3J{&@%!})Ph?J!e{_=H<R[5<Tm!e=?H(5r$Y4enm[%3!MM=!H)$EMyLp=n&G*pf3<]75G&7$GeYFP{r-$!=M#?tT}f=e#Tnm=({@(_GY)nNt$#?}N]_[_{{G<#f*+R@&NE4Je4}f!Nmn!7JAP3Ln$5}77(p<[}#*Y%5eYH}%hEPrM(A<p=+&{$RFNG!)+<>_&Ah=_$ty$-5TRtM?hN$_N3Y*_e";
const salt = "eJ5>{A{H5n)57L!(3h+N%m)>>7[EGLh_)+7Y@!)Tf&MAy}(R@+3%M4=]=<*M#mMRmE7M@rN@+$EYTrP@#(r=Hpt{hh5}4PN_P?5]%ReL=t@@f=hJMGpn!$y(N7$]nF-f[7%%MG_(m}$%((yY4JL{=mhYNnn$-<3MM!{AE-#%y=G(p5L])Gf)$Y%@y>M7$+&ATY!-]=AF%N?hM44<!LFMnR5YHF[F]N($RR{J+J@_@yT+?#@T(@ef]tMY5<Nn@E=G";

window.onload = async () => {
    const canvas = document.getElementById('canvas');
    const encrypted = await fetch('encrypted.json').then(res => res.json());
    const decrypted = await aesDecrypt(encrypted, password, salt);
    const dataURL = "data:image/png;base64," + decrypted;
    createImageBitmap(toBlob(dataURL)).then(bitmap => {
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        // add copyright
        ctx.font = "22px MS Gothic";
        ctx.fillStyle = '#ff0000';
        ctx.fillText("© potproject.net", canvas.width - 200, canvas.height - 10);
    });
};

function toBlob(base64) {
    var bin = atob(base64.replace(/^.*,/, ''));
    var buffer = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i);
    }
    try{
        var blob = new Blob([buffer.buffer], {
            type: 'image/png'
        });
    }catch (e){
        return false;
    }
    return blob;
}

async function aesDecrypt(data, password, salt){
    // Using Web Crypto API
    const { subtle } = crypto;
    const key = await subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    const derivedKey = await subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: new TextEncoder().encode(salt),
            iterations: 100000,
            
            // SHA-256
            hash: 'SHA-256'
        },
        key,
        {
            name: 'AES-CBC',
            length: 256
        },
        false,
        ['encrypt', 'decrypt']
    );
    const iv = atob(data.iv);
    const ivArrayBuffer = new Uint8Array(iv.length);
    for(let i = 0; i < iv.length; i++){
        ivArrayBuffer[i] = iv.charCodeAt(i);
    }

    const encrypted = atob(data.encrypted);
    const encryptedArrayBuffer = new Uint8Array(encrypted.length);
    for(let i = 0; i < encrypted.length; i++){
        encryptedArrayBuffer[i] = encrypted.charCodeAt(i);
    }

    const decrypted = await subtle.decrypt(
        {
            name: 'AES-CBC',
            iv: ivArrayBuffer
        },
        derivedKey,
        encryptedArrayBuffer
    );
    return new TextDecoder().decode(decrypted);
}