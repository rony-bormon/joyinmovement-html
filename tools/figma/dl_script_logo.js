const https = require('https');
const fs = require('fs');

const url = "https://s3-alpha-sig.figma.com/img/0182/f9b4/f7853d05be006ce0a85478cab1b65e79?Expires=1794182400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=irAb5cCScE0H0lSgtNfTgu0ljkvSutQq27-RodH3Z7dyBd~aFCYQQ1yhqmz-3e~LJbdeBua2rncpANAPucBmuFh0zmdOvdShnBpONgO5RG6Wy9zwsPHMc-OHtQmKUdss1E1CahT52sq9bdtEQWQ89MGKPsKyupPPbAiZAteuRIXkSL2i-Kq32gDYOls9uoM~P4cMrZRI24DdbolRLb3x8XkC7GMHxbmGBIGBdC9f562G8vFKyGW0fdE4nxnovO0Ws7hSB3hRqMhSH2er9Ce2N1C6S~BYdtLSRvhRel76P-pYr-hPkjMtVMLgGL9zu3Wf3gNSbHD7olxTye1Lr9Z1CA__";

https.get(url, res => {
  const file = fs.createWriteStream('assets/jim_logo_script.png');
  res.pipe(file);
  file.on('finish', () => console.log('Successfully updated assets/jim_logo_script.png'));
});

