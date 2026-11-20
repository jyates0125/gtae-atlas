/* Atlas 16.8 — independently sourced, mission-scoped What / When / Where / Why / How guides.
 * Step titles are heist planning guidance, never instructions for real-world conduct.
 * Exact coordinates and rotating objectives are NOT inferred from illustrative map art.
 */
(()=>{'use strict';
const id=String(document.body.dataset.heist||'');
if(!document.body.classList.contains('j120-heist-page'))return;
const box=document.querySelector('.mapbox');if(!box||document.getElementById('j168-heist-guide'))return;
const S=(phase,title,what,when,where,why,how,mapTerm='',status='source-backed')=>({phase,title,what,when,where,why,how,mapTerm,status});
const U={
 cayo:'https://www.gtabase.com/gta-online/jobs/heists/the-cayo-perico-heist',
 kortz:'https://www.gtabase.com/missions/gta-online/heists/the-kortz-center-heist',
 casino:'https://www.gtaboom.com/diamond-casino-heist-scope-out-all-access-points-and-points-of-interest-c29d',
 fleeca:'https://www.gtabase.com/gta-online/jobs/heists/the-fleeca-job',
 humane:'https://www.gtabase.com/gta-online/jobs/heists/the-humane-labs-raid',
 prison:'https://www.gtabase.com/gta-online/jobs/heists/the-prison-break',
 originals:'https://gta.wiki/w/Heists_in_GTA_Online',
 doomsday:'https://gta.wiki/w/The_Doomsday_Heist'
};
const missions={
 'cayo-perico':{lead:'Independent island intel, equipment, approach and finale planning. Loot and treasure positions vary by visit.',source:U.cayo,steps:[
 S('prereq','Unlock the Kosatka','Meet Miguel Madrazo and acquire the Kosatka planning submarine.','Before hosting your first Cayo heist.','Visit The Music Locker at Diamond Casino, then purchase the Kosatka through the in-game service.','The submarine is the host planning hub.','Follow the introductory meeting, acquire the submarine, and use its planning screen to start gathering intel.'),
 S('intel','Gather Intel','Scope the primary target and usable island entrances; optional loot and equipment are additional intel.','At the beginning of each planning cycle.','Start Gather Intel from the Kosatka; visit the island undercover.','The primary target and entry information unlock planning and informed approach choices.','Reach the island using the marked transport, inspect the compound using the security feed, and photograph scoping locations when prompted.','Control Tower'),
 S('intel','Scope compound and drainage tunnel','Identify available compound entrances, routes, secondary loot and underwater access.','During island reconnaissance, before choosing approach preps.','El Rubio compound; coastline and drainage tunnel entrance.','Scoping additional entrances allows more finale entry choices.','Check prompted reconnaissance spots, then confirm discovered options in the Kosatka planning screen. Do not assume daily loot appears at a fixed location.','Drainage Tunnel'),
 S('prep','Choose one approach vehicle','Complete the prep for your intended insertion vehicle, such as Kosatka, Longfin or aircraft.','After essential intel and before the finale.','Use the Kosatka prep board; the acquisition mission location is supplied in game.','Only prepared vehicles become selectable for the finale.','Choose a route first, start its vehicle preparation, secure the mission vehicle or required equipment, and finish the marked delivery.','Airstrip'),
 S('prep','Acquire entry equipment','Collect the approach-dependent equipment; Cutting Torch supports the drainage-tunnel entry.','Before choosing the corresponding access point in the finale.','Equipment prep missions launched from the submarine planning board.','Specific entry approaches depend on having the right equipment.','Select the needed prep, follow the mission target marker, and deliver the item to complete the prep. Requirements differ with your chosen approach.','Drainage Tunnel'),
 S('prep','Prepare weapons and optional disruption','Complete weapon loadout prep; consider disruption work when planning a louder approach.','Before launching the finale.','Weapons and Disruption sections of the Kosatka board.','The finale loadout is tied to completed preps; optional disruption can lower opposition advantages.','Finish the chosen weapon loadout job and any useful disruption jobs. Check the board before launching.','Power Station'),
 S('finale','Choose insertion, compound entry and escape','Set approach vehicle, infiltration point, compound entry, escape, time and weapon loadout.','After required intel/preps are complete.','Kosatka final planning screen, then Cayo island.','Your route depends on what was discovered and prepared.','Review available options, coordinate them with actual island map POIs, take the primary target, then escape using the current mission objective.','El Rubio Compound'),
 S('challenges','Check Elite and loot progress','Review the currently displayed Elite conditions and optional loot bag objectives.','Before the finale and again during the results screen.','Kosatka finale board and actual in-game challenge/award display.','Challenge conditions and bag capacity affect planning.','Use the existing Elite tracker, confirm active rules in your game version, and compare the final screen with your saved notes.','Secondary loot areas','reference')
 ]},
 'kortz-center':{lead:'Kortz Center is a real Pacific Bluffs museum heist, not just a general GTA Online map. Interior routes must follow what your actual scope-out reveals.',source:U.kortz,steps:[
 S('prereq','Host with a Mansion Art Studio','A host needs a Mansion with the Art Studio upgrade. Joining another host does not require owning it.','Before starting your own Kortz heist.','Your Mansion / Art Studio planning space.','The Art Studio provides heist planning and the artwork-copy operation.','Acquire the required property and expansion, then use its heist planning interface. Guests can instead join an eligible host.'),
 S('intel','Scope Out Kortz Center','Visit the museum and identify the primary painting, optional loot and access possibilities.','Before the heist preparations and finale.','Kortz Center museum, Pacific Bluffs; the Bell Building features in the scope-out.','The information supports approach choice and valuable secondary objectives.','Start the Kortz scope mission, follow the visitor/inspection prompts, document any accessible paintings and route possibilities, and record only what the game verifies.','Museum frontage'),
 S('intel','Build a gallery-specific POI list','Distinguish the public frontage, gallery rooms, objective painting, surveillance and possible exits.','While scoping, and before selecting a finale approach.','Your scope results inside Kortz Center; not the schematic coordinates.','Interior planning depends on what is actually discovered, not random pins on an imagined floor plan.','Select the matching site-plan POI, write its actual location in mission notes, and mark it scoped; revise the route after comparing with gameplay.','Gallery zone','research'),
 S('prep','Prepare equipment and approach','Finish the heist planning jobs that become available after scoping, then choose your loadout.','After museum scope-out and before finale launch.','Mansion Art Studio and the setup mission locations shown on the map.','The jobs give your crew tools and choices for the museum robbery.','Use the game planning board in order; complete each task at its marked location, return to the studio, and review the available equipment.','Planning intel'),
 S('finale','Choose a clean museum route','Choose the discovered entry path, painting objectives and escape option; crew size may change loot capacity.','When your prep board allows the finale.','Kortz Center exterior and galleries in Pacific Bluffs.','A clean approach may preserve the value of stolen artwork.','Follow the scope-backed access plan, secure the required painting and any feasible optional art, then exit by a discovered route and finish the mission extraction.','Exit plan'),
 S('challenges','Track optional goals separately','Plan optional secondary artwork and compare any in-game career/tier requirements.','Before finale launch and at the completion screen.','Mansion planning display and current GTA Online Career Progress.','Not every custom challenge or map pin is an official tier requirement.','Use the mission challenge tracker for personal planning, then confirm any official tier criteria from your game menu.','','reference')
 ]},
 'diamond-casino':{lead:'Arcade-based planning with casino access photography, vault intel and one of three finale approaches.',source:U.casino,steps:[
 S('prereq','Set up an Arcade','Acquire an Arcade and complete its initial setup to use the Casino Heist planning boards.','Before hosting the heist.','Your Arcade property.','The boards organize Casino Scope Out, Vault Contents, prep and the finale.','Start the Casino Heist introduction, buy an Arcade and finish its launch/setup mission.'),
 S('intel','Photograph the main entrance','Register the mandatory Casino Scope Out access photograph.','On your first scope-out, before selecting finale options.','Diamond Casino main entrance.','This is the baseline access point for the planning board.','Start Casino Scope Out and photograph the exterior main doors; optional access photos expand future planning choices.','Main entrance'),
 S('intel','Scope extra access routes','Photograph doors and tunnels such as Staff Lobby, Waste Disposal, Security Tunnel, Sewer and roof entrances.','During optional Casino Scope Out.','Around the casino, below the racetrack and on roof levels.','Additional locations reveal more ways to approach and leave.','Follow the casino perimeter and relevant roof/tunnel paths, photograph the access targets the game registers, and verify each on the board.','Security tunnel'),
 S('intel','Identify Vault Contents','Use camera intel to discover the current vault target.','Before locking your finale approach.','Vault Contents mission from the Arcade board, via casino camera access.','Vault target identification is required for heist planning.','Begin the mission, access the designated surveillance feed and inspect the target until the mission registers its contents.','Vault camera'),
 S('prep','Choose approach and required jobs','Plan Silent & Sneaky, The Big Con or Aggressive and collect approach-specific gear.','After casino and vault intel.','Arcade heist boards; prep mission locations vary.','Approach selection determines prep requirements and relevant access points.','Choose one approach, complete its required vehicles/weapons/keycard/support preps, and review access and exit choices with your crew.','Staff lobby'),
 S('finale','Execute a scoped approach','Use a discovered entry and exit, reach the vault and complete the getaway.','After the board allows finale launch.','Diamond Casino and selected escape areas.','Different approaches demand different tactics.','Follow the heist objective prompts, manage available vault time, then exit using your selected plan and escape the pursuit.','Exit planning'),
 S('challenges','Review Elite / Career goals','Check the current Elite and Career Progress criteria for your chosen approach.','Before the finale.','In-game heist board and career menu.','Exact timed goals vary and should not be invented.','Compare the displayed conditions with your route and record completed goals separately from the general mission checklist.','','reference')
 ]},
 'fleeca':{lead:'Two-player original heist: Scope Out, Kuruma, then the Driver/Driller finale.',source:U.fleeca,steps:[
 S('prereq','Unlock heist planning','Get access to the apartment heist planning room and Lester’s introductory instructions.','Before hosting Scope Out.','High-end apartment planning room and Lester contact.','The first original heist starts from the host heist board.','Follow Lester’s introduction, open your apartment board and invite your second player.'),
 S('intel','Scope Out','Survey the Fleeca location and rehearse the initial preparation.','First setup.','Bank approach area shown by Lester’s mission markers.','The scouting job prepares the two-person finale.','Start Scope Out from the heist board, follow the drive/inspection instructions and complete the required delivery.','Scope Out'),
 S('prep','Acquire the Kuruma','Complete the armored Kuruma vehicle setup.','After Scope Out, before the finale.','Mission-designated vehicle pickup and delivery points.','The vehicle supports the getaway.','Start Kuruma from the board, obtain the indicated vehicle and deliver it as directed.','Kuruma setup'),
 S('finale','Driver and Driller','Split roles, reach the bank, complete the vault objective and escape.','Once both setups are complete.','Fleeca bank finale instance.','Each player has a separate task.','Confirm roles before launching, follow the role prompts at the bank and use your prepared getaway method to finish.','Vault')
 ]},
 'humane-labs':{lead:'Four-player lab raid: key codes, Insurgents, EMP, Valkyrie, and stealth EMP delivery before the finale.',source:U.humane,steps:[
 S('prereq','Access the Humane Raid','Host through the original heist chain when available, or join an eligible host.','Before the setup series.','Original apartment-heist board.','Access to the heist strand is required for hosting.','Complete preceding requirements or use an invited team to begin Humane Labs.'),
 S('prep','Key Codes and Insurgents','Secure lab access codes and two Insurgent vehicles.','Early setup stage.','Marked exchange and vehicle locations in the setup missions.','These are used to prepare the raid.','Launch each setup from the board, secure the codes or vehicles, and finish the deliveries shown on the mission HUD.','Insurgent vehicles'),
 S('prep','EMP and Valkyrie','Acquire the EMP device and the helicopter support needed for the raid.','Before the stealth delivery and finale.','Mission-marked airfield/aircraft locations.','The EMP and air support are key heist resources.','Complete EMP and Valkyrie setup jobs, following the assigned teams and current objectives.','Valkyrie support'),
 S('prep','Deliver EMP','Move the EMP into Humane Labs while avoiding a failed stealth operation.','After EMP acquisition, before finale.','Humane Labs delivery entrance.','Positions the device for the raid.','Complete the designated stealth delivery to the lab using the mission-provided route; coordinate with the team.','EMP delivery'),
 S('finale','Raid the facility','Infiltrate the labs and complete the data objective, then escape.','After all setups.','Humane Labs and coastal exit area.','This completes the heist.','Assign air/ground roles, follow the HUD objectives through the lab, and regroup at the extraction point.','Lab interior')
 ]},
 'prison-break':{lead:'Plane, Bus, Station and Wet Work setups prepare a four-player extraction.',source:U.prison,steps:[
 S('prereq','Launch the Prison Break','Prepare an eligible heist host and crew.','Before four setup jobs.','Original apartment-heist board.','Each role needs a suitable teammate.','Select the heist and assign roles using the planning board.'),
 S('prep','Plane','Acquire the aircraft for the extraction.','Before finale.','Marked airfield setup.','The finale escape depends on the plane.','Complete the Plane setup and verify it registers as finished.','Airfield'),
 S('prep','Bus, Station and Wet Work','Complete transport, identity/access and witness-related preparation missions.','Before finale.','Each marked setup destination; these are multiple distinct places.','These jobs open the extraction operation.','Start each of the three named jobs from the heist board and complete its current objective sequence.','Prison bus'),
 S('finale','Extract Rashkovsky','Coordinate prison team, pilot and air-support roles.','After the setups.','Bolingbroke Penitentiary and the designated escape pickup.','Mission roles are interdependent.','Follow the role-specific tasks, extract Rashkovsky and regroup at the aircraft to finish.','Prisoner extraction')
 ]},
 'series-a':{lead:'Multiple setup locations; do not interpret the board as a single literal map.',source:U.originals,steps:[
 S('prereq','Begin Series A Funding','Organize the original-heists crew for the mission strand.','Before setup missions.','Heist planning apartment.','The jobs prepare the final pickup operation.','Begin the series from the planning board with the required team.'),
 S('prep','Coke / Trash Truck / Bikers','Complete the three named setup jobs, each at its separate mission location.','Ahead of the finale.','Different GTA Online destinations; use each job marker.','The heist collects resources across several operations.','Open each setup separately, follow objectives and mark its completion only after success.','Coke'),
 S('prep','Weed / Meth','Finish the remaining setup jobs.','After or alongside permitted earlier setups, before finale.','Distinct designated sites.','Completes preparation for the final operation.','Coordinate deliveries and combat objectives using the current HUD markers.','Meth'),
 S('finale','Series A Funding finale','Finish the combined finale delivery/defense operation.','After all required setups.','Finale-selected route.','Concludes the mission chain.','Assign roles, protect the required vehicles or resources and finish the marked objectives.','Finale')
 ]},
 'pacific-standard':{lead:'Bank-focused original heist with several preparation jobs and a multi-stage escape.',source:U.originals,steps:[
 S('prereq','Unlock Pacific Standard','Use an eligible original-heists host and full crew.','Before setups.','Apartment planning board.','The mission is part of the original heist chain.','Start the mission once available on the board.'),
 S('prep','Vans, Signal, Hack, Convoy, Bikes','Finish the preparation jobs that secure intelligence and getaway resources.','Before finale.','Mission-specific sites across Los Santos/Blaine County.','Each contributes to reaching and leaving the bank.','Complete each named setup and confirm it is checked off on the in-game board.','Vans'),
 S('finale','Bank and escape','Complete the bank objective and coordinate getaway choices.','After all setups.','Pacific Standard bank district and escape route selected during play.','The escape is a separate planning problem.','Assign crew tasks, finish the bank phase, then navigate using actual in-game mission cues.','Bikes')
 ]},
 'doomsday-act-1':{lead:'Facility-based Act I preparation, three named setups and the Data Breaches finale.',source:U.doomsday,steps:[
 S('prereq','Use your Facility planning room','Host the Doomsday act from an eligible Facility.','Before starting Act I.','Facility planning room.','The Facility is the act command center.','Open the Doomsday board and begin Act I.','Facility hub'),
 S('prep','Equipment and three setups','Prepare the Paramedic Equipment, Deluxos and Akula dependencies; complete Dead Courier, Signal Intercepts and Server Farm.','Before the Data Breaches finale.','Different mission locations shown by the active prep/setup jobs.','Unlocks Act I finale.','Use the act board to acquire each prerequisite and finish its paired setup.','Server Farm'),
 S('finale','The Data Breaches','Complete the act finale after required setups.','Once available on the board.','Mission-designated finale location.','Finishes Act I.','Coordinate roles and follow current mission instructions; do not rely on schematic pins as exact coordinates.','Data Breaches finale')
 ]},
 'doomsday-act-2':{lead:'Act II spans land, air and submarine objectives; use regional map support where necessary.',source:U.doomsday,steps:[
 S('prereq','Start Act II at your Facility','Launch the next available act.','After required Doomsday progression.','Facility planning room.','Unlocks The Bogdan Problem preparation chain.','Choose Act II and review live board requirements.'),
 S('prep','Prepare rescue and submarine work','Complete the required setups involving Rescue ULP, hard drives and related equipment.','Before the finale.','Multiple active GTA Online mission markers, including coastal areas.','The finale depends on several connected missions.','Finish the jobs displayed in the Facility board and check each unlock.','ULP / rescue'),
 S('finale','The Bogdan Problem','Coordinate submarine and support roles.','Once the act board allows finale.','Mission-designated marine and aircraft areas.','The operation spans more than one location.','Follow role-specific objectives and complete the extraction/recovery tasks.','Submarine')
 ]},
 'doomsday-act-3':{lead:'Act III includes regional equipment setups and The Doomsday Scenario.',source:U.doomsday,steps:[
 S('prereq','Start Act III','Use the Facility planning board once the previous progression allows it.','Before Act III preparations.','Facility property.','The board defines current mission dependencies.','Select Act III and check each prerequisite.'),
 S('prep','Barrage / Khanjali / Air Defenses','Complete the relevant equipment and setup jobs.','Ahead of the finale.','Several regional GTA Online locations supplied by the mission.','The finale relies on previous preparation.','Run each available board job and confirm it registers before launching.','Khanjali'),
 S('finale','The Doomsday Scenario','Complete the act finale objectives with your team.','After the required setups.','Finale destination shown in game.','Closes the Doomsday mission chain.','Use the assigned team roles and current objective prompts; the concept diagram is not a tunnel blueprint.','Scenario finale')
 ]}
};
const fallback={
 'cluckin-bell':{lead:'The farm raid is a linked investigation, setup and finale strand; location prompts vary by stage.',source:'https://www.gtabase.com/gta-online/jobs/heists/',steps:[
 S('prereq','Start the raid strand','Meet the relevant mission contact and start its planning sequence.','Before the first mission.','Current GTA Online activity marker.','Unlocks the job chain.','Follow the introduction prompts and activate the next displayed mission.', '', 'research'),
 S('prep','Complete the setup missions','Gather equipment and vehicle resources indicated by the mission.','Before the farm finale.','Mission-specific markers, not a permanent farm map.','Unlocks the raid.','Follow each setup mission from the in-game board/phone and check completion.','Vehicle prep','research'),
 S('finale','Raid and escape','Finish the main farm objectives and extraction.','After setups.','Finale farm/warehouse area.','Completes the strand.','Use the current objectives and your saved entry and escape plan.','Farm perimeter','research')]},
 'salvage-yard':{lead:'Rotating vehicle-robbery board: select the specific active robbery before assuming a location.',source:'https://www.gtabase.com/gta-online/jobs/heists/',steps:[
 S('prereq','Open the active robbery board','Use a Salvage Yard to select the currently available robbery.','Before planning.','Your Salvage Yard.','Different robberies have distinct destinations.','Check the active board and record which robbery is selected.','Robbery selection','research'),
 S('prep','Complete this robbery’s preparatory jobs','Do the jobs listed for the current target vehicle.','Before its finale.','Mission-dependent GTA Online locations.','Unlocks the chosen robbery.','Follow the board’s current objectives and update your personal plan.','Mission staging','research'),
 S('finale','Recover the target vehicle','Complete the selected robbery and delivery.','After required setups.','Varies with robbery.','Brings the target to the requested destination.','Follow mission route prompts and confirm completion in game.','Target vehicle','research')]},
 'auto-shop':{lead:'Contract missions differ by selection, so keep each contract’s progress separate.',source:'https://www.gtabase.com/gta-online/jobs/heists/',steps:[
 S('prereq','Pick an Auto Shop contract','Select an available contract on the Auto Shop job board.','Before setup.','Your Auto Shop.','Each contract has separate objectives.','Review the contract and record the selected job.','Contract board','research'),
 S('prep','Complete contract setups','Finish the selected contract’s setup tasks.','Before finale.','Current contract markers, not one permanent local map.','Enables the finale.','Complete each listed objective and verify the board.','Setup area','research'),
 S('finale','Execute the contract','Finish the chosen contract-specific finale and escape.','After setups.','Contract-specific location.','Completes that job.','Follow the selected contract’s objectives and mark progress locally.','Finale zone','research')]},
 'agency-vip':{lead:'VIP Contract investigation and recovery stages span several Los Santos sites.',source:'https://www.gtabase.com/gta-online/jobs/heists/',steps:[
 S('prereq','Begin the VIP Contract','Access the Agency VIP Contract after completing required Agency introduction.','Before investigation work.','Agency computer / office.','Starts the multi-stage contract.','Choose the relevant active contract and examine mission prompts.','Agency office','research'),
 S('intel','Complete investigation missions','Follow the active investigations and collect their clues or objectives.','Before the finale strand.','Multiple Los Santos mission destinations.','They progress the contract story.','Launch each investigation and follow the marked task; save useful location notes.','Investigation','research'),
 S('finale','Complete the final mission sequence','Finish the contract’s linked finale stages.','After required investigations.','Locations shown by the current contract.','Completes the VIP strand.','Follow stage-specific mission instructions and check completion on the Agency board.','Finale objective','research')]}
};
Object.assign(missions,fallback);
const config=missions[id];if(!config)return;
const H=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=String(txt);return x;};
const section=H('section','j168-guide');section.id='j168-heist-guide';section.setAttribute('aria-labelledby','j168-title');
const top=H('div','j168-head');const left=H('div');left.append(H('span','j168-kicker','MISSION INTEL · PREPS · FINALE'));
const title=H('h2','','How to complete this heist');title.id='j168-title';left.append(title,H('p','',config.lead));
const note=H('small','j168-status','Source-informed guide · Verify live game prompts and variable targets');
top.append(left,note);section.append(top);
const nav=H('div','j168-tabs');nav.setAttribute('role','group');nav.setAttribute('aria-label','Guide stage filter');
const phases=[['all','All steps'],['prereq','Unlock'],['intel','Intel'],['prep','Preps'],['finale','Finale'],['challenges','Challenges']];
let phase='all',query='',selected=0;
const store='teamjura-heist-walkthrough-v1:'+id;let completed=[];
try{const saved=JSON.parse(localStorage.getItem(store)||'{}');if(Array.isArray(saved.done))completed=saved.done.filter(v=>Number.isInteger(v)&&v>=0&&v<config.steps.length);}catch(_){}
const save=()=>{try{localStorage.setItem(store,JSON.stringify({version:1,done:completed,updatedAt:new Date().toISOString()}))}catch(_){}};
const filterButtons=[];
for(const [key,label] of phases){const b=H('button','j168-tab',label);b.type='button';b.setAttribute('aria-pressed',String(key==='all'));b.onclick=()=>{phase=key;for(const [k,btn] of filterButtons)btn.setAttribute('aria-pressed',String(k===key));render()};filterButtons.push([key,b]);nav.append(b)}
section.append(nav);
const search=H('input','j168-search');search.type='search';search.placeholder='Find prerequisites, setups, objectives…';search.setAttribute('aria-label','Search heist walkthrough steps');search.addEventListener('input',()=>{query=search.value.trim().toLowerCase();render()});section.append(search);
const progress=H('p','j168-progress','');progress.setAttribute('aria-live','polite');section.append(progress);
const content=H('div','j168-layout');const items=H('div','j168-step-list');items.setAttribute('aria-label','Guide stages');const detail=H('article','j168-step-detail');detail.setAttribute('aria-live','polite');content.append(items,detail);section.append(content);
const footer=H('div','j168-footer');const link=H('a','','Open guide source ↗');link.href=config.source;link.target='_blank';link.rel='noopener noreferrer';
footer.append(H('span','','Maps are mission-planning references; exact layouts, loot, rewards and official tiers must match current gameplay.'),link);
const exportBtn=H('button','j168-export','Export walkthrough progress');exportBtn.type='button';
exportBtn.onclick=()=>{const str=JSON.stringify({heist:id,completedStepIndexes:completed,reviewDate:'2026-11-20',source:config.source},null,2);const url=URL.createObjectURL(new Blob([str],{type:'application/json'}));const a=H('a');a.href=url;a.download='team-jura-'+id+'-walkthrough.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)};
footer.append(exportBtn);section.append(footer);
function showMap(term){const map=document.getElementById('j167-heist-map');if(!map)return;const input=map.querySelector('.j167-search');if(input){input.value=term;input.dispatchEvent(new Event('input',{bubbles:true}))}map.scrollIntoView({block:'start',behavior:'smooth'})}
function renderDetails(){
 const s=config.steps[selected];detail.replaceChildren();if(!s){detail.append(H('p','','Choose a guide step to see details.'));return}
 const badge=H('span','j168-stage-badge',s.phase.toUpperCase()+' · '+(s.status==='research'?'RESEARCH GUIDE':s.status==='reference'?'CHECK CURRENT GAME':'SOURCE-INFORMED'));
 detail.append(badge,H('h3','',s.title));
 const fields=[['What',s.what],['When',s.when],['Where',s.where],['Why',s.why],['How',s.how]];
 const dl=H('dl','j168-fields');for(const [k,v] of fields){dl.append(H('dt','',k),H('dd','',v))}detail.append(dl);
 const actions=H('div','j168-actions');
 const done=H('button','j168-done',completed.includes(selected)?'✓ Completed · undo':'Mark completed');done.type='button';
 done.onclick=()=>{completed=completed.includes(selected)?completed.filter(x=>x!==selected):[...completed,selected];save();render()};actions.append(done);
 if(s.mapTerm){const map=H('button','j168-map','Show related map POI ↑');map.type='button';map.onclick=()=>showMap(s.mapTerm);actions.append(map)}
 detail.append(actions);
 const citation=H('p','j168-cite','Guide status: '+(s.status==='research'?'general planning; exact details unverified':s.status==='reference'?'check the current official game menu':'source-informed, with mission variations possible')+'.');detail.append(citation);
}
function render(){
 items.replaceChildren();const filtered=config.steps.map((s,i)=>({...s,i})).filter(s=>(phase==='all'||s.phase===phase)&&(!query||(s.title+' '+s.what+' '+s.how+' '+s.where).toLowerCase().includes(query)));
 if(!filtered.length)items.append(H('p','j168-empty','No stages match this filter. Use All steps to see the available guide.'));else{
 if(!filtered.some(s=>s.i===selected))selected=filtered[0].i;
 for(const s of filtered){const b=H('button','j168-step',undefined);b.type='button';b.setAttribute('aria-pressed',String(s.i===selected));b.append(H('span','j168-step-number',String(s.i+1).padStart(2,'0')),H('span','j168-step-name',s.title),H('span','j168-step-check',completed.includes(s.i)?'✓':'›'));b.onclick=()=>{selected=s.i;render()};items.append(b)}
 }
 progress.textContent=completed.length+' / '+config.steps.length+' guide steps marked complete · saved in this browser only';
 renderDetails();
}
const focus=box.querySelector('.j167-focus');if(focus)focus.insertAdjacentElement('afterend',section);else box.append(section);
render();
})();
