function subscribeOscAddr(oscAddr, updates) {
    send('10.10.1.12', '10023', '/subscribe', {type:'s', value:oscAddr}, {type:'i', value:updates});
}

function unsubscribeOscAddr(oscAddr) {
    send('10.10.1.12', '10023', '/unsubscribe', {type:'s', value:oscAddr}, {type:'i', value:'50'});
}

function renew() {
    send('10.10.1.12', '10023', '/renew')
}

//First channel of each stereo mix
const names = [
    'iain', 
    'stu', 
    'adam',
    'paul', 
];

const ch = [
  "01", "02", "03", "04", "05",
  "06", "07", "08", "10", "13", 
  "14", "15", "18", "20", "25", 
  "27", "28", "29", "30" 
];

const mix = {
    'iain':{mix:'01', ch: ch, osc: {level:[], pan:[]}}, 
    'stu' :{mix:'03', ch: ch, osc: {level:[], pan:[]}}, 
    'adam' :{mix:'05', ch: ch, osc: {level:[], pan:[]}}, 
    'paul' :{mix:'07', ch: ch, osc: {level:[], pan:[]}}, 
};

function mix2Name(mixNo) {
  for (const key in mix) {
    if (mix[key].mix === mixNo) {
      return key;
    }
  }
  return null; // Return null if no matching mix value is found
}

// Construct the OSC addresses
for (const key in mix) {
  if (Object.hasOwnProperty.call(mix, key)) {
    const entry = mix[key];
    // Clear the osc.level array (if needed)
    entry.osc.level = [];
    entry.osc.pan = [];
    entry.osc.channelstrip = [];
    entry.osc.eq_f = [
        `/bus/${mix[key].mix}/eq/1/f`, 
        `/bus/${mix[key].mix}/eq/2/f`, 
        `/bus/${mix[key].mix}/eq/3/f`, 
    ];
    entry.osc.eq_g = [
        `/bus/${mix[key].mix}/eq/1/g`, 
        `/bus/${mix[key].mix}/eq/2/g`, 
        `/bus/${mix[key].mix}/eq/3/g`, 
    ];
    // Iterate over each channel in the ch array
    for (const channel of entry.ch) {
      // Construct the OSC path string and add it to osc.level array
      entry.osc.level.push(`/ch/${channel}/mix/${entry.mix}/level`);
      entry.osc.pan.push(`/ch/${channel}/mix/${entry.mix}/pan`);
      entry.osc.channelstrip.push(`/ch/${channel}/config/name`);
    }
  }
}


function subscribeToMixes() {
    for (const key in mix) {
        if (Object.hasOwnProperty.call(mix, key)) {
            const entry = mix[key];
            entry.osc.level.forEach(oscAddr => {
                setTimeout(() => {
                    subscribeOscAddr(oscAddr, 2);
                }, 200);
            });
            entry.osc.pan.forEach(oscAddr => {
                setTimeout(() => {
                    subscribeOscAddr(oscAddr, 2);
                }, 400);
            });
            entry.osc.channelstrip.forEach(oscAddr => {
                setTimeout(() => {
                    subscribeOscAddr(oscAddr, 99);
                }, 600);
            });
        }
    }
};

function createMixer() {
    let faders = {}, 
        pan = {}, 
        channelstrip = {}, 
        eq_gain = {}, 
        eq_freq = {},
        eq_gain_labels = {},
        eq_freq_labels = {};

    for (const key in mix) {
        if (Object.hasOwnProperty.call(mix, key)) {
            const entry = mix[key];
            let count = 1
            faders[key] = []
            pan[key] = []
            channelstrip[key] = []
            eq_gain[key] = []
            eq_freq[key] = []
            eq_gain_labels[key] = []
            eq_freq_labels[key] = []

            entry.osc.level.forEach(oscAddr => {
                faders[key].push({
                    type: 'fader',
                    id: `mix_${mix[key]["mix"]}_chn_${count}_level`,
                    address: oscAddr,
                    target: '10.10.1.12:10023',
                    design: 'compact',
                    expand: true
                });
                count+=1
            });
            count = 1
            entry.osc.pan.forEach(oscAddr => {
                pan[key].push({
                    type: 'knob',
                    id: `mix_${mix[key]["mix"]}_chn_${count}_pan`,
                    address: oscAddr,
                    target: '10.10.1.12:10023',
                    default: 0.5,
                    doubleTap: true,
                    sensitivity: 0.1,
                    expand: true
                });
                count+=1
            });
            count = 1
            entry.osc.channelstrip.forEach(oscAddr => {
                channelstrip[key].push({
                    type: 'text',
                    id: `mix_${mix[key]["mix"]}_chnstrp_${count}`,
                    target: '10.10.1.12:10023',
                    address: oscAddr,
                    value: `OSC{${oscAddr}}`,
                    vertical: false,
                    wrap: 'soft',
                    align: 'center',
                    colorText: "#fffeb0", 
                    // css: `:host{font-size: 12px;text-shadow: 1px 1px 2px black}`,
                    css: `:host{font-size: 12rem;font-weight:bold;text-shadow: 0px 0px 8px black}`,
                    expand: true
                });
                count+=1
            });
            count = 1
            entry.osc.eq_g.forEach(oscAddr => {
                eq_gain[key].push({
                    type: 'fader',
                    id: `mix_${mix[key]["mix"]}_eq_${count}_gain`,
                    address: oscAddr,
                    target: '10.10.1.12:10023',
                    design: 'round',
                    expand: true,
                    default: 0.5,
                    doubleTap: true,
                    onValue: `set("mix_${mix[key]["mix"]}_eq_${count}_gain_label", (value * 30 - 15).toFixed(1) + " dB");`
                });
                count+=1
            });
            count = 1
            entry.osc.eq_f.forEach(oscAddr => {
                eq_freq[key].push({
                    type: 'knob',
                    id: `mix_${mix[key]["mix"]}_eq_${count}_freq`,
                    address: oscAddr,
                    target: '10.10.1.12:10023',
                    // design: 'round',
                    expand: true,
                    default: 0.5,
                    doubleTap: true,
                    onValue: `set("mix_${mix[key]["mix"]}_eq_${count}_freq_label", 20 * Math.pow(20000 / 20, value).toFixed(1) + " Hz");`
                });
                count+=1
            });
            count = 1
            entry.osc.eq_g.forEach(oscAddr => {
                eq_gain_labels[key].push({
                    type: 'text',
                    id: `mix_${mix[key]["mix"]}_eq_${count}_gain_label`,
                    target: '10.10.1.12:10023',
                    colorText: "#fffeb0", 
                    expand: true,
                    css: `:host{font-size: 12rem;font-weight:bold;text-shadow: 0px 0px 8px black}`,
                });
                count+=1
            });
            count = 1
            entry.osc.eq_f.forEach(oscAddr => {
                eq_freq_labels[key].push({
                    type: 'text',
                    id: `mix_${mix[key]["mix"]}_eq_${count}_freq_label`,
                    target: '10.10.1.12:10023',
                    colorText: "#fffeb0", 
                    expand: true,
                    css: `:host{font-size: 12rem;font-weight:bold;text-shadow: 0px 0px 8px black}`,
                });
                count+=1
            });
        }
    }
    names.forEach(name => {
        setTimeout(() => {
            receive('', '', '/EDIT', `${name}_mixer_faders`, { widgets: faders[name], layout: 'horizontal' });
        }, 200);               

        setTimeout(() => {
            receive('', '', '/EDIT', `${name}_mixer_pan`, { widgets: pan[name], layout: 'horizontal' });
        }, 400);               

        setTimeout(() => {
            receive('', '', '/EDIT', `${name}_mixer_channelstrip`, { widgets: channelstrip[name], layout: 'horizontal' });
        }, 600);               
        setTimeout(() => {
            receive('', '', '/EDIT', `${name}_eq_gain`, { widgets: eq_gain[name], layout: 'horizontal' });
        }, 800);               
        setTimeout(() => {
            receive('', '', '/EDIT', `${name}_eq_freq`, { widgets: eq_freq[name], layout: 'horizontal' });
        }, 800);               
        setTimeout(() => {
            receive('', '', '/EDIT', `${name}_eq_gain_labels`, { widgets: eq_gain_labels[name], layout: 'horizontal' });
        }, 800);               
        setTimeout(() => {
            receive('', '', '/EDIT', `${name}_eq_freq_labels`, { widgets: eq_freq_labels[name], layout: 'horizontal' });
        }, 800);               
    });
};
//


// setInterval(renew, 9000);
setInterval(subscribeToMixes, 30000);



module.exports = {

    init: async function(){
        subscribeToMixes();
        createMixer();
    },
    reload: async function(){
        subscribeToMixes();
        createMixer();
    },
    oscInFilter: function(data){
        // console.log("OSC Data:", data);
        var {address, args, host, port, clientId} = data

        // if (address.includes('eq') {
        //     if (address.endswith('f')){
        //         prevfreq = 
        //     };
        //     if (address.endswith('g')){
        //     };
        //
        // }

        return data;
    },
    oscOutFilter:function(data){
        // Filter outgoing osc messages

        var {address, args, host, port, clientId} = data

        return {address, args, host, port}
    }
}









