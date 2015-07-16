var hashes = {
	3159615086: 'glimmer',
	1415355184: 'crucible marks',
	1415355173: 'vanguard marks',
	898834093: 'exo',
	3887404748: 'human',
	2803282938: 'awoken',
	3111576190: 'male',
	2204441813: 'female',
	671679327: 'hunter',
	3655393761: 'titan',
	2271682572: 'warlock',
	3871980777: 'New Monarchy',
	529303302: 'Cryptarch',
	2161005788: 'Iron Banner',
	452808717: 'Queen',
	3233510749: 'Vanguard',
	1357277120: 'Crucible',
	2778795080: 'Dead Orbit',
	1424722124: 'Future War Cult'
};

var weeklyMarks = {
	2033897742: 'VM',
	2033897755: 'CM'
};

var activityHashes = {
	1564581372: "The Will of Crota",
	1564581373: "The Will of Crota",
	1564581374: "The Will of Crota",
	2071946061: "Winter's Run",
	2071946062: "Winter's Run",
	2071946063: "Winter's Run",
	2418687432: "The Nexus",
	2418687433: "The Nexus",
	2418687435: "The Nexus",
	2619245816: "The Will of Crota",
	2619245818: "The Will of Crota",
	2619245819: "The Will of Crota",
	325091109: "The Will of Crota",
	325091110: "The Will of Crota",
	325091111: "The Will of Crota",
	3468792472: "The Devil's Lair",
	3468792473: "The Devil's Lair",
	3468792474: "The Devil's Lair",
	3896672076: "Summoning Pits",
	3896672078: "Summoning Pits",
	3896672079: "Summoning Pits",
	3992306896: "The Will of Crota",
	3992306898: "The Will of Crota",
	3992306899: "The Will of Crota",
	692589233: "Cerberus Vae III",
	692589234: "Cerberus Vae III",
	692589235: "Cerberus Vae III",
	921825796: "The Will of Crota",
	921825797: "The Will of Crota",
	921825799: "The Will of Crota",
	325091108: "The Will of Crota",
	3896672077: "Summoning Pits",
	2418687434: "The Nexus",
	1564581375: "The Will of Crota",
	2071946060: "Winter's Run",
	2619245817: "The Will of Crota",
	3468792475: "The Devil's Lair",
	3992306897: "The Will of Crota",
	692589232: "Cerberus Vae III",
	921825798: "The Will of Crota",
	2659248071: "Vault of Glass",
	2659248068: "Vault of Glass",
	2591274210: "The Devil's Lair",
	3304208793: "Cerberus Vae III",
	2495639390: "Winter's Run"
};

var crotasEnd = 1836893116;
var vogEasy = 2659248071;
var vogHard = 2659248068;

// Timed Event Hash IDs
var heroic = 0;
var nightfall = 0;

var userList = [];
var userIndex = 0;
var characterIndex = 0;

var charHtml;

var weeklyResetTime = getResetTime();

function getResetTime() {
	var now = new Date();
	var resetTime = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
		
	// Weekly reset time is Tuesday at 9:00AM UTC
	var offset = resetTime.getUTCDay() - 2;
	if (offset < 0) {
	    offset += 7;
	}
	
	resetTime.setUTCDate(resetTime.getUTCDate() - offset);
	resetTime.setUTCHours(9);
	resetTime.setUTCMinutes(0);
	resetTime.setUTCSeconds(0);
	
	return resetTime;
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function getJson(url, success, failure) {
	var urlQuery = 'select * from json where url="' + url + '"';
	$.ajax({
		url: 'https://query.yahooapis.com/v1/public/yql',
		data: {
			q: urlQuery,
			format: "json"
		},
		dataType: "jsonp",
		success: function (data) {
			success(data);
		},
		error: function (result) {
			failure(result);
		}
	});
}

function clanSearch() {
	// TODO - only 50 members per page so for giant clans will need to keep checking pages until no results left
	// totalResults / 50 rounded up
	getJson('https://www.bungie.net/Platform/Group/135331/MembersV3/?currentPage=1',
		function(data) {
			if (!data || !data.query.results.json.Response) {
				alert("clanSearch");
				clanSearch();
				return;
			}
			var results = data.query.results.json.Response.results; 
			buildUserLists(results);
		},
		function(error) {
			// TODO - error stuff
		});
}

function buildUserLists(results) {
			for (var i = 0; i < results.length; ++i) {
				if (results[i].user.xboxDisplayName) {
					userList.push(results[i].user.xboxDisplayName);
				}		
			}
			userList.sort();
			getNextUser();
}

function getNextUser() {
	var url = 'https://www.bungie.net/Platform/Destiny/SearchDestinyPlayer/1/' + userList[userIndex] + '/';
	getJson(url,
		function(data) {
			if (!data || !data.query || !data.query.results || !data.query.results.json || !data.query.results.json.Response) {
				alert("getNextUser");
				getNextUser();
				return;
			}
			var player = data.query.results.json.Response;
			var charUrl = 'https://www.bungie.net/Platform/Destiny/tigerXbox/Account/' + player.membershipId + '/';
			
			getJson(charUrl,
				function(data) {
					var characters = data.query.results.json.Response.data.characters;
					
					if (characters.length > 0) {
						// Create all container for this user and add user name.
						$('#container').append('<div class="userContainer" id="user_' + userIndex + '"><div class="userHeader">'+ player.displayName +'</div></div>'); // TODO - could just add this to the display string probably???
						parseCharacterData(player, characters);						
					}
				},
				function(result) {
					// TODO - do error stuff
				});
		},
		function(result) {
			// TODO - do error stuff
		});
}

function parseCharacterData(player, characters) {
		var lastPlayed = new Date(characters[characterIndex].characterBase.dateLastPlayed)
		if ((nightfall == 0) && (lastPlayed > weeklyResetTime)) {
			getTimedEvents(player, characters);
		} else {
			charHtml = "";
			/*
			// Create character container and output level and race. Note container will need to be closed at the end of processing this character.
			charHtml = '<div class="charContainer"><div class="charHeader">' + characters[characterIndex].characterLevel + ' ' + hashes[characters[characterIndex].characterBase.classHash].capitalize() + '</div>';
			*/
			// Output weekly marks
			var url = 'https://www.bungie.net/Platform/Destiny/TigerXbox/Account/' + player.membershipId + '/Character/' + characters[characterIndex].characterBase.characterId + '/Progression/';
			getJson(url,
				function(data) {
					if (!data || !data.query || !data.query.results || !data.query.results.json || !data.query.results.json.Response) {
						alert("parseCharacterData");
						parseCharacterData(player, characters);
						return;
					}
					charHtml = "";
					// Create character container and output level and race. Note container will need to be closed at the end of processing this character.
					charHtml = '<div class="charContainer"><div class="charHeader">' + characters[characterIndex].characterLevel + ' ' + hashes[characters[characterIndex].characterBase.classHash].capitalize() + '</div>';
					var progressions = data.query.results.json.Response.data.progressions;
					for (var progIndex = 0; progIndex < progressions.length; progIndex++) {
						if (weeklyMarks[progressions[progIndex].progressionHash]) {
							var marksType = weeklyMarks[progressions[progIndex].progressionHash];
							charHtml += '<div class="currencyContainer"><div class="' + marksType + ' currencies"></div><div class="currencyText">' + progressions[progIndex].level + '</div></div>';
						}
					}
					getActivities(player, characters);
				},
				function(result) {
					// TODO - do error stuff
			});
		}
}

function getActivities(player, characters) {
	// Output weekly strike activities
	var actUrl = 'https://www.bungie.net/Platform/Destiny/TigerXbox/Account/' + player.membershipId + '/Character/' + characters[characterIndex].characterBase.characterId + '/Activities/';
	getJson(actUrl,
		function(data) {
			if (!data || !data.query || !data.query.results || !data.query.results.json || !data.query.results.json.Response) {
				getActivities(player, characters);
				return;
			}
			var hasNF;
			var hasWH;			
			var activities = data.query.results.json.Response.data.available;				
			for (var actIndex = 0; actIndex < activities.length; actIndex++) {
				if (activities[actIndex].activityHash == nightfall) {
					hasNF = activities[actIndex].isCompleted;
					if (hasWH) { break; }
				} else if (activities[actIndex].activityHash == heroic) {
					hasWH = activities[actIndex].isCompleted;
					if (hasNF) { break; }
				}
			} 
			charHtml += '<div class="NF acts ' + (hasNF === 'true' ? 'actComplete' : 'actIncomplete') + '">Nightfall</div>' +
			            '<div class="WH acts ' + (hasWH === 'true' ? 'actComplete' : 'actIncomplete') + '">Weekly Heroic</div>';
			
			getRaidStatus(player, characters);
		},
		function(result) {
			// TODO - do error stuff
	});
}

function getRaidStatus(player, characters) {
	
	var url = 'http://www.bungie.net/platform/Destiny/Stats/ActivityHistory/TigerXbox/' + player.membershipId + '/' + characters[characterIndex].characterBase.characterId + '/?mode=Raid&page=0';
	getJson(url,
		function(data) {
			if (!data || !data.query || !data.query.results || !data.query.results.json || !data.query.results.json.Response) {
				getRaidStatus(player, characters);
				return;
			}
			var hasVogEasy;
			var hasCE;
			// If a character has never attempted a raid then data will be null.
			if (data.query.results.json.Response.data) {
				var activities = data.query.results.json.Response.data.activities;
				for (var i = 0; i < activities.length; i++) {
					var activityDate = new Date(activities[i].period);
					if (activityDate > weeklyResetTime) {
						if (activities[i].activityDetails.referenceId == crotasEnd) {
							hasCE = activities[i].values.completed.statId;
							if (hasVogEasy) { break; }
						} else if (activities[i].activityDetails.referenceId == vogEasy) {
							hasVogEasy = activities[i].values.completed.statId;
							if (hasCE) { break; }
						}
					}
				}
			}
			// Output raid status
			charHtml += '<div class ="VoG acts ' + (hasVogEasy === "completed" ? 'actComplete' : 'actIncomplete') + '">Vault of Glass</div>' +
			            '<div class ="CE acts ' + (hasCE === "completed" ? 'actComplete' : 'actIncomplete') + '">Crota\'s End</div></div>';
			// Append complete character data to user's set of characters.
			$("#user_" + userIndex).append(charHtml);
			
			// Check if more characters are left, otherwise check if more users are left.
			if (characterIndex < (characters.length - 1)) {
				characterIndex++;
				parseCharacterData(player, characters);
			} else if (userIndex < (userList.length - 1)) {
				characterIndex = 0;
				userIndex++;
				getNextUser();
			}
		},
		function(result) {
			// TODO - error stuff
	});
}

function getTimedEvents(player, characters) {
	var url = 'https://www.bungie.net/platform/Destiny/TigerXbox/Account/' + player.membershipId + '/Character/' + characters[characterIndex].characterBase.characterId + '/Activities/?definitions=true';
	getJson(url,
		function(data) {
			if (!data || !data.query.results.json.Response) {
				getTimedEvents(player, characters);
				return;
			}
			var activities = data.query.results.json.Response.definitions.activities;
			$.each(activities, function(key, value) {
				if (value.activityLevel == 30) {
					if (value.activityName == 'Weekly Heroic Strike') {
						heroic = value.activityHash;
					} else if (value.activityName == 'Weekly Nightfall Strike') {
						nightfall = value.activityHash;
					}
				}			
			});
			$('#events').append('Weekly Strike: ' + activityHashes[nightfall]);
			parseCharacterData(player, characters);
		},
		function(result) {
		// TODO - do error stuff
	});
}

$( document ).ready(clanSearch());

