// Re-audit the deep-scan compute-cloud upgrades with the HARDENED cloud-detect (apex-anchored).
// Re-scans each, outputs the new verdict; parent corrects false positives (old=compute but the
// hardened scan says other/cloudflare = apex isn't really on that cloud). Free, read-only here.
import fs from "node:fs";
const SRC = fs.readFileSync("src/forge.jsx", "utf8");
const BASE = "https://nvjizahtcqgmfhiodtej.supabase.co";
const ANON = (SRC.match(/anonKey:\s*\n?\s*"([^"]+)"/) || [])[1];
const CONC = 5;
const C = [
{id:"19e700817eer5j4r6",domain:"bostaden.umea.se",old:"aws"},{id:"19e700817eeqq2tct",domain:"gavlegardarna.se",old:"azure"},{id:"imp-4b2ff48422e6",domain:"adlibris.com",old:"aws"},{id:"nn-amedia.no",domain:"amedia.no",old:"aws"},{id:"nn-anicura.se",domain:"anicura.se",old:"aws"},{id:"imp-bbe08368b8b4",domain:"babyshop.com",old:"aws"},{id:"imp-047e2e3ed00e",domain:"bokio.se",old:"azure"},{id:"19e700817f0p0gq8y",domain:"bostad.stockholm.se",old:"azure"},{id:"imp-376f8cca142b",domain:"bubbleroom.se",old:"azure"},{id:"imp-e47a0f2ffbf1",domain:"centra.com",old:"aws"},{id:"imp-a9a19bdae636",domain:"cervera.se",old:"aws"},{id:"19e7004be1732nuxa",domain:"corite.com",old:"aws"},{id:"19e7004be17tlh2zm",domain:"coursio.com",old:"aws"},{id:"nn-deepoceangroup.com",domain:"deepoceangroup.com",old:"aws"},{id:"imp-97b0a59104ac",domain:"depict.ai",old:"aws"},{id:"imp-ac8fe375b5c0",domain:"desenio.com",old:"aws"},{id:"nn-erst.dk",domain:"erst.dk",old:"azure"},{id:"19e700817ef9jlb9p",domain:"fastighetsagarna.se",old:"azure"},{id:"nn-flex.com",domain:"flex.com",old:"aws"},{id:"19e7004be17pksgip",domain:"gilion.com",old:"aws"},{id:"19e700817eekluj4j",domain:"bostadsbolaget.se",old:"azure"},{id:"imp-d6d67f5e0353",domain:"hmgroup.com",old:"azure"},{id:"imp-99732b78333a",domain:"happysignals.com",old:"azure"},{id:"nn-hhs.se",domain:"hhs.se",old:"aws"},{id:"imp-d173f338a3a1",domain:"hibox.tv",old:"aws"},{id:"nn-hkscan.com",domain:"hkscan.com",old:"azure"},{id:"imp-ce74db058bbd",domain:"hopsworks.ai",old:"aws"},{id:"imp-c06f709e3283",domain:"humly.com",old:"gcp"},{id:"nn-ikea.com",domain:"ikea.com",old:"aws"},{id:"nn-inwido.com",domain:"inwido.com",old:"aws"},{id:"imp-32626c661bf2",domain:"kicks.se",old:"aws"},{id:"nn-leroy.no",domain:"leroy.no",old:"aws"},{id:"nn-loomis.com",domain:"loomis.com",old:"aws"},{id:"19e700817eer2fjv2",domain:"lkf.se",old:"azure"},{id:"imp-cabda7c4e9cc",domain:"matsmart.se",old:"aws"},{id:"nn-metsagroup.com",domain:"metsagroup.com",old:"aws"},{id:"imp-49c938ed7f9a",domain:"netigate.net",old:"aws"},{id:"imp-55a2424e6b17",domain:"pinmeto.com",old:"aws"},{id:"nn-planmeca.com",domain:"planmeca.com",old:"azure"},{id:"nn-rentokil-initial.com",domain:"rentokil-initial.com",old:"aws"},{id:"19e700817f0x12ihh",domain:"rikshem.se",old:"azure"},{id:"imp-de71a16722f2",domain:"rule.io",old:"aws"},{id:"nn-scania.com",domain:"scania.com",old:"aws"},{id:"imp-df9ed3866b18",domain:"skincity.com",old:"gcp"},{id:"imp-ee8b0add8a38",domain:"upsales.com",old:"aws"},{id:"imp-e42b28af42f9",domain:"varjo.com",old:"aws"},{id:"nn-vaxjo.se",domain:"vaxjo.se",old:"aws"},{id:"nn-volvo.com",domain:"volvo.com",old:"aws"},{id:"19e700817f1fx8zvg",domain:"willhem.se",old:"azure"},{id:"imp-fd9c9c9125fe",domain:"winningtemp.com",old:"aws"},{id:"nn-yara.com",domain:"yara.com",old:"aws"},{id:"nn-yit.fi",domain:"yit.fi",old:"aws"},{id:"nn-zenitel.com",domain:"zenitel.com",old:"aws"}
];
async function scan(domain){
  try{
    const r=await fetch(BASE+"/functions/v1/cloud-detect",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+ANON,apikey:ANON},signal:AbortSignal.timeout(90000),body:JSON.stringify({domains:[domain]})});
    const j=await r.json(); return (j.report||[])[0]||{provider:"error"};
  }catch(e){return {provider:"error",error:String(e.message||e).slice(0,40)};}
}
const out=[]; let done=0,changed=0;
const q=[...C];
async function worker(){
  while(q.length){
    const c=q.shift(); const rep=await scan(c.domain);
    const np=rep.provider, ac=rep.apex_class||"?";
    const isChange = np!==c.old; if(isChange) changed++;
    out.push({id:c.id,domain:c.domain,old:c.old,new:np,conf:rep.confidence||"",apex:ac,services:(rep.services||[]).join("/"),asns:(rep.asns||[]).join(",")});
    done++;
    console.log(`${done}/${C.length} ${c.domain.padEnd(26)} ${c.old} -> ${np} (apex ${ac}, ${rep.confidence||""}) ${isChange?"*** CHANGED":""}`);
    if(done%10===0) fs.writeFileSync("_reaudit_out.json",JSON.stringify({done,changed,results:out},null,1));
  }
}
console.log(`Re-audit ${C.length} deep-flagged cloud verdicts with hardened detector, conc ${CONC}`);
await Promise.all(Array.from({length:CONC},worker));
fs.writeFileSync("_reaudit_out.json",JSON.stringify({done,changed,done_flag:true,results:out},null,1));
console.log(`=== DONE === ${done} re-scanned | ${changed} changed verdict`);
console.log("CHANGES:");
for(const r of out.filter(x=>x.new!==x.old)) console.log(`  ${r.domain}\t${r.old} -> ${r.new}\t(apex ${r.apex})`);
