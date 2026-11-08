'use strict';
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url='https://fempai.github.io/dre-after-dark-life-os/';
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
  if(!response||!response.ok())throw Error('Life OS returned '+response?.status());
  await page.waitForSelector('nav#nav button[data-view="plants"]',{timeout:20000});
  await page.locator('nav#nav button[data-view="plants"]').click();
  await page.waitForSelector('#specimenCardsV2>.plant',{timeout:20000});
  const count=await page.locator('#specimenCardsV2>.plant').count();
  if(count<24)throw Error('Conservatory roster has only '+count+' specimens');
  const grid=await page.locator('#specimenCardsV2').evaluate(e=>{const s=getComputedStyle(e);return {columns:s.gridTemplateColumns,display:s.display,width:e.getBoundingClientRect().width}});
  if(grid.display!=='grid'||grid.width<250)throw Error('Conservatory grid not full width: '+JSON.stringify(grid));
  await page.locator('nav#nav button[data-view="settings"]').click();
  await page.waitForSelector('#releaseReadiness',{timeout:20000});
  const readiness=await page.locator('#releaseReadiness').innerText();
  if(!/28\/28 runtime checks passing/.test(readiness))throw Error('Readiness is not 28/28: '+readiness.slice(0,180));
  if(!await page.locator('#privacyControls [data-clear-life]').count())throw Error('Local data controls absent');
  if(errors.length)throw Error('Browser exceptions: '+errors.slice(0,5).join('; '));
  console.log('PASS Life OS published mobile: HTTP '+response.status()+', specimens '+count+', grid '+JSON.stringify(grid)+', 28/28 checks, privacy controls present');
  const academy=await browser.newPage({viewport:{width:390,height:844}});
  const ar=await academy.goto('https://fempai.github.io/The-Art-of-Movement/',{waitUntil:'domcontentloaded',timeout:45000});
  if(!ar||!ar.ok())throw Error('Movement homepage returned '+ar?.status());
  const wr=await academy.goto('https://fempai.github.io/The-Art-of-Movement/weekday-bfr-plan.html',{waitUntil:'domcontentloaded',timeout:45000});
  if(!wr||!wr.ok())throw Error('Movement BFR plan returned '+wr?.status());
  if(!/November 9, 2026/.test(await academy.locator('body').innerText()))throw Error('Movement Nov 9 start date missing');
  console.log('PASS Movement published homepage and Nov 9 BFR plan: HTTP '+ar.status()+'/'+wr.status());
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
