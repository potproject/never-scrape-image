
const fs = require('fs');
const crypto = require('crypto');

const password = "G<pt%N{tNL5A[*)tprRrL$++?h>tA4F3={]h(?3J{&@%!})Ph?J!e{_=H<R[5<Tm!e=?H(5r$Y4enm[%3!MM=!H)$EMyLp=n&G*pf3<]75G&7$GeYFP{r-$!=M#?tT}f=e#Tnm=({@(_GY)nNt$#?}N]_[_{{G<#f*+R@&NE4Je4}f!Nmn!7JAP3Ln$5}77(p<[}#*Y%5eYH}%hEPrM(A<p=+&{$RFNG!)+<>_&Ah=_$ty$-5TRtM?hN$_N3Y*_e";
const salt = "eJ5>{A{H5n)57L!(3h+N%m)>>7[EGLh_)+7Y@!)Tf&MAy}(R@+3%M4=]=<*M#mMRmE7M@rN@+$EYTrP@#(r=Hpt{hh5}4PN_P?5]%ReL=t@@f=hJMGpn!$y(N7$]nF-f[7%%MG_(m}$%((yY4JL{=mhYNnn$-<3MM!{AE-#%y=G(p5L])Gf)$Y%@y>M7$+&ATY!-]=AF%N?hM44<!LFMnR5YHF[F]N($RR{J+J@_@yT+?#@T(@ef]tMY5<Nn@E=G";

async function main(){
    const file = await loadFile('plain.png');
    const base64 = Buffer.from(file).toString('base64');
    const encrypted = await aesEncrypt(base64, password, salt);
    await saveFile('encrypted.json', JSON.stringify(encrypted));
}

async function loadFile(path){
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if(err){
                reject(err);
            }else{
                resolve(data);
            }
        });
    });
}

async function saveFile(path, data){
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if(err){
                reject(err);
            }else{
                resolve();
            }
        });
    });
}

async function aesEncrypt(data, password, salt){
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
    const iv = crypto.randomBytes(16);
    const encrypted = await subtle.encrypt(
        {
            name: 'AES-CBC',
            iv

        },
        derivedKey,
        new TextEncoder().encode(data)
    );
    return {
        iv: Buffer.from(iv).toString('base64'),
        encrypted: Buffer.from(encrypted).toString('base64')
    };
}

main();