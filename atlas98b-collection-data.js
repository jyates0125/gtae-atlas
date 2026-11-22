/* Team Jura Atlas 9.8B · cited game-specific collection totals; NOT mapped pin datasets.
 * Cross-platform / edition discrepancies are deliberately not collapsed into one number. */
(function(root){'use strict';const wiki='https://thegta.wiki/wiki/';
const sources={
 'iii':{'Hidden packages':{count:100,url:wiki+'hidden-packages-in-gta-iii/'},'Rampages':{count:20,url:wiki+'collectibles/'},'Unique stunt jumps':{count:20,url:'https://gtamap.io/gta-3-map/'}},
 'vc':{'Hidden packages':{count:100,url:'https://gtamap.io/gta-vice-city-map/'},'Rampages':{count:35,url:'https://gtamap.io/gta-vice-city-map/'},'Stunt jumps':{count:36,url:'https://gtamap.io/gta-vice-city-map/'}},
 'vcs':{'Red balloons':{count:99,url:wiki+'red-balloons/'},'Rampages':{count:30,url:wiki+'collectibles/',note:'PSP edition 30; use the separate PS2 checklist if playing that edition.'},'Stunt jumps':{count:30,url:wiki+'collectibles/',note:'PSP edition 30; use the separate PS2 checklist if playing that edition.'},'Rampages (PS2)':{count:35,url:'https://gtamap.io/gta-vice-city-stories-map/',note:'PS2 edition only. Separate full checklist; PSP slots are not automatically transferred.'},'Stunt jumps (PS2)':{count:36,url:'https://gtamap.io/gta-vice-city-stories-map/',note:'PS2 edition only. Separate full checklist; PSP slots are not automatically transferred.'}},
 'lcs':{'Hidden packages':{count:100,url:wiki+'hidden-packages-in-gta-liberty-city-stories/'},'Rampages':{count:20,url:'https://gtamap.io/gta-liberty-city-stories-map/',note:'Some censored editions omit seven rampages; consult your edition.'},'Stunt jumps':{count:26,url:'https://gtamap.io/gta-liberty-city-stories-map/'}},
 'ctw':{'Security cameras':{count:100,url:wiki+'security-cameras/'},'Rampages':{count:30,url:wiki+'100-completion-in-gta-chinatown-wars/',note:'Standard count; use the separate PSP checklist for 35.'},'Unique jumps':{count:30,url:wiki+'unique-stunt-jumps-in-gta-chinatown-wars/'},'Rampages (PSP)':{count:35,url:wiki+'100-completion-in-gta-chinatown-wars/',note:'Separate full PSP checklist; no automatic slot transfer.'},'Riding Shotguns':{count:5,url:wiki+'100-completion-in-gta-chinatown-wars/',note:'Standard count; PSP has eight.'},'Riding Shotguns (PSP)':{count:8,url:wiki+'100-completion-in-gta-chinatown-wars/',note:'Separate PSP checklist.'},'Lions of Fo':{count:2,url:wiki+'collectibles/',note:'Two collectibles out of 20 possible locations; these slots are not spawn positions.'}},
 'tlad':{'Seagulls':{count:50,url:wiki+'seagulls-in-tlad/'}},
 'tbogt':{'Seagulls':{count:50,url:wiki+'seagulls-in-tbogt/'},'Base jumps':{count:15,url:'https://bloxodes.com/wiki/gta-4-tbogt/base-jumps'}}
};
root.TeamJuraClassicCollections=Object.freeze(sources);
})(window);
