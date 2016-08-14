require('dotenv').config({silent: true});

var express = require('express');
var app = express();
var http = require('http');
app.use(express.static(__dirname + "/src"));

httpserver = http.createServer(app);

httpserver.listen(8080, "0.0.0.0", function() {
    var addr = httpserver.address();
    console.log("Server listening at ", addr.address + ":" + addr.port);
});

// fake bot 
if (process.env.FAKE_BOT_ENABLED == "true") {
    function moreOrLess(pos) {
        pos = [
            pos[0] + 0.002*(Math.random() - 1/2.0),
            pos[1] + 0.002*(Math.random() - 1/2.0)
        ];
        return pos;
    }

    var io = require('socket.io')(httpserver);
    var pos = [48.856297, 2.297987];
    io.of("/event").on('connection', function (socket) {
        socket.emit('bot_initialized', { 
            username: "user",
            player: { level: 1, experience: 600, prev_level_xp: 0, next_level_xp: 1000 },
            storage: { max_pokemon_storage: 250, max_item_storage: 350 },
            coordinates: pos
        });

        setInterval(() => {
            var ppos = moreOrLess(pos);
            socket.emit("pokemon_caught", {
                pokemon: {
                    pokemon_id: Math.floor(Math.random() * 150) + 1,
                    combat_power: 1000,
                    potential: 0.8,
                    combat_power_multiplier: 0.5,
                    additional_cp_multiplier: 0.3
                },
                position: { latitude: ppos[0], longitude: ppos[1] }
            });
        }, 20*1000);

        setTimeout(() => {
            socket.emit("route", [[48.856603319884364,2.301196312102997,0],[48.856643338029656,2.30127150697733,0],[48.85666926561629,2.301345000517194,0],[48.856720358473005,2.3014171892769126,0],[48.85677372654939,2.3014820514937244,0],[48.856808474384195,2.3015491181205694,0],[48.85672745357895,2.3015766493181014,0],[48.856683300672415,2.30163918103557,0],[48.85665303390711,2.3017127030897897,0],[48.856598226256985,2.3017696238279246,0],[48.85656315220135,2.3018434250815907,0],[48.856536796160384,2.3017439578392027,0],[48.85650516276107,2.3016740320391644,0]]);
        }, 5*1000);

        socket.on('pokemon_list', () => {
            socket.emit("pokemon_list", {
                candy: { 10: 50, 100: 50 },
                pokemon: [
                    { 
                        unique_id: "1234", pokemon_id: 10, combat_power: 1000, potential: 0.5,
                        combat_power_multiplier: 0.5, additional_cp_multiplier: 0.3,
                        attack: 10, defense: 10, hp: 50, max_hp: 50, stamina: 10, favorite: 0
                    },
                    { 
                        unique_id: "456", pokemon_id: 100, combat_power: 1000, potential: 0.5,
                        combat_power_multiplier: 0.5, additional_cp_multiplier: 0.3,
                        attack: 10, defense: 10, hp: 50, max_hp: 50, stamina: 10, favorite: 1
                    }
                ]
            });
        });

        socket.on('inventory_list', () => {
            socket.emit("inventory_list", {
                inventory: { 1: 100, 401: 10, 701: 100, 901: 1 }
            });
        });

        socket.on('eggs_list', () => {
            socket.emit("eggs_list", {
                km_walked: 1.0,
                egg_incubators: [
                    { item_id: 901, target_km_walked: 2.5, start_km_walked: 0.5, pokemon_id: 1 },
                    { item_id: 902, target_km_walked: 2.5, start_km_walked: 0.5, pokemon_id: 2 }
                ],
                eggs: [
                    { unique_id: 1234, total_distance: 10, walked_distance: 0 }
                ]
            });
        });

        socket.on('transfer_pokemon', (data) => { console.log("transfer: " + data.id); });
        socket.on('evolve_pokemon', (data) => { console.log("evolve: " + data.id); });
        socket.on('drop_items', (data) => { console.log("drop: " + data.id + " - " + data.count); });
        socket.on('favorite_pokemon', (data) => { console.log("favorite: " + data.id + " - " + data.favorite); });
    });
}