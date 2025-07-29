// Generic Strings
const root_url = "https://electro-smith.github.io/Programmer"

// New changes involve reading from sources.json to find the 'sources' we should pull from
// Those sources replace the previously hard coded 'examples.json' file, and should otherwise 
// function the same.

// The changes should primarily only affect gatherExampleData

// When imported the examples will have the original data located in the .json file
// as well as the 'source' field containing the data structure used to find the example

var data = { 
    platforms: [],
    examples: [],
    no_device: true,
    sel_platform: null,
    sel_example: null,
    firmwareFile: null,
    blinkFirmwareFile: null,
    bootloaderFirmwareFile: null,
    displayImportedFile: false,
    displaySelectedFile: false
}

// Global Buffer for reading files
var ex_buffer

// Gets the root url
// should be https://localhost:9001/Programmer on local
// and https://electro-smith.github.io/Programmer on gh-pages
function getRootUrl() {
    var url = document.URL;
    return url;
}

// Reads the specified file containing JSON example meta-data
// function gatherExampleData()
// {
//     // Get Source list as data 
//     var self = this // assign self to 'this' before nested function calls...
//     var src_url = getRootUrl().concat("data/sources.json") 
//     var raw = new XMLHttpRequest();
//     raw.open("GET", src_url, true);
//     raw.responseType = "text"
//     raw.onreadystatechange = function ()
//     {
//         if (this.readyState === 4 && this.status === 200) {
//             var obj = this.response; 
//             buffer = JSON.parse(obj);
//             buffer.forEach( function(ex_src) {
//                 // Launch another request with async function to load examples from the 
//                 // specified urls 
//                 // This will fill examples directly, and replace the importExamples/timeout situation.
//                 var ext_raw = new XMLHttpRequest();
//                 ext_raw.open("GET", ex_src.data_url, true);
//                 ext_raw.responseType = "text"
//                 ext_raw.onreadystatechange = function ()
//                 {
//                     if (this.readyState === 4 && this.status === 200) {
//                         // Now this.response will contain actual example data 
//                         var ext_obj = this.response;
//                         ex_buffer = JSON.parse(ext_obj);
//                         // Now we could just fill the examples data
//                         // ex_buffer.forEach( function(ex_data) {
//                         //     console.log("%s - %s", ex_src.name, ex_data.name);
//                         // })
//                         const unique_platforms = [...new Set(ex_buffer.map(obj => obj.platform))]
//                         // This needs to be fixed to 'ADD' examples
//                         //self.examples = data
//                         self.examples.push(ex_buffer)
//                         var temp_platforms = self.platforms.push(unique_platforms)

//                         const new_platforms = [...new Set(temp_platforms.map(obj => obj))]
//                         self.platforms = new_platforms
//                     }
//                 }
//                 ext_raw.send(null)

//                     // var self = this
//                     // const unique_platforms = [...new Set(data.map(obj => obj.platform))] 
//                     // self.examples = data
//                     // self.platforms = unique_platforms
//             })
//         }
//     }
//     raw.send(null)
// }


function displayReadMe(fname)
{
    var url = self.data.sel_example.url
    fname   = fname.substring(5,fname.length-4);
    
    div = document.getElementById("readme")

    marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function(code, language) {
            const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
            return hljs.highlight(validLanguage, code).value;
        },
        pedantic: false,
        gfm: true,
        breaks: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false
    });
    
    
    fetch(url)
    .then(response => response.text())
        .then(text => div.innerHTML = marked.parse(text.replace("404: Not Found", "No additional details available for this example.")));
}

async function readServerFirmwareFile(path, dispReadme = true)
{
    return new Promise((resolve) => {
        var buffer
        var raw = new XMLHttpRequest();
        var fname = path;
    
        if(dispReadme){
            displayReadMe(fname)
        }
    
        raw.open("GET", fname, true);
        raw.responseType = "arraybuffer"
        raw.onreadystatechange = function ()
        {
            if (this.readyState === 4 && this.status === 200) {
                resolve(this.response)
            }    
        }
        raw.send(null)
    })
}

var app = new Vue({
    el: '#app',
    template: 
    `
    <b-container class="app_body">
        <div align="center">
            <button id="detach" disabled="true" hidden="true">Detach DFU</button>
            <button id="upload" disabled="true" hidden="true">Upload</button>
            <b-form id="configForm">
                <p> <label for="transferSize"  hidden="true">Transfer Size:</label>
                <input type="number" name="transferSize"  hidden="true" id="transferSize" value="1024"></input> </p>
                <p> <span id="status"></span> </p>

                <p><label hidden="true" for="vid">Vendor ID (hex):</label>
                <input hidden="true" list="vendor_ids" type="text" name="vid" id="vid" maxlength="6" size="8" pattern="0x[A-Fa-f0-9]{1,4}">
                <datalist id="vendor_ids"> </datalist> </p>

                <div id="dfuseFields" hidden="true">
                    <label for="dfuseStartAddress" hidden="true">DfuSe Start Address:</label>
                    <input type="text" name="dfuseStartAddress" id="dfuseStartAddress"  hidden="true" title="Initial memory address to read/write from (hex)" size="10" pattern="0x[A-Fa-f0-9]+">
                    <label for="dfuseUploadSize" hidden="true">DfuSe Upload Size:</label>
                    <input type="number" name="dfuseUploadSize" id="dfuseUploadSize" min="1" max="2097152" hidden="true">
                </div>
            </b-form>
        </div>
        <b-row align="center" class="app_column">
            <div>
                <legend>HiChord Web Programmer</legend>
                <p> Update your HiChord to REV 1.8 (JUNE 2025) </p>
                <p> NEW:DRUM LOOP MODE, DRONE MODE, MINOR SCALE, TAP TEMPO, CRASH DETECTION, SMART SLEEP + BATTERY IMPROVEMENT, BUTTON DETECTION OVERHAUL, BUG FIXES </p>
                <br>
                <div>
                    <b-button variant="es" v-b-toggle.collapseFeatures>⏺ View New Features & Instructions</b-button>
                    <b-collapse id="collapseFeatures" class="mt-2">
                        <div class="feature-box">
                            <h3>⏺ New Features Since Rev 1.8:</h3>
                            <p class="feature-summary">FM Synthesis, Preset Save System, Ear Training Mode, Dual-Track Looper, High Quality Sample Playback, Real-time Filter/Attack/Release Control, Sequencer Enhancements, Quick Sound/Mode Selection, Slash Chords, Musical Randomizer, Rhythm Rate Switching, Chord Type Lock, Tap Tempo, and Improved Metronome.</p>
                            
                            <h4>Feature List with Instructions:</h4>
                            <ol class="feature-list">
                                <li><strong>FM Synthesis</strong> - Access 5 FM presets (HX7 Piano, FM E.Piano, FM Organ, FM Brass, FM Bell) via waveform selection menu.</li>
                                <li><strong>Preset Save System</strong> - Hold Function 2 + Function 3 to open preset menu. Use joystick left/right to select slot (P1/P2), up to save, down to load.</li>
                                <li><strong>Ear Training Mode</strong> - Enter Ear Training mode, click joystick to start. Use joystick left/right to select difficulty level (1-4), click to begin. Listen to demo chord, then guess which chord button (1-7) was played.</li>
                                <li><strong>Dual-Track Looper</strong> - In Looper mode: Press any chord button to start/stop recording on track 1. Second press loops. Hold to clear. Use joystick left/right to switch between tracks. Metronome toggles automatically with bar count setting.</li>
                                <li><strong>High Quality Sample Playback</strong> - Select Acoustic Piano or Strings via waveform menu. Full polyphonic playback with ADSR envelope control.</li>
                                <li><strong>Real-time Filter Control</strong> - Hold Function 3 + turn volume wheel to adjust filter cutoff. Must move wheel significantly after pressing Function 3. Visual bar shows frequency.</li>
                                <li><strong>Real-time Attack Control</strong> - Hold Function 1 + turn volume wheel to adjust attack time. Must move wheel significantly after pressing Function 1. Display shows milliseconds.</li>
                                <li><strong>Real-time Release Control</strong> - Hold Function 2 + turn volume wheel to adjust release time. Must move wheel significantly after pressing Function 2. Display shows milliseconds.</li>
                                <li><strong>Sequencer Controls</strong> - In Sequencer mode: Press chord buttons to record steps. Joystick click toggles play/stop. Hold joystick left/right to change pattern length. Sequencer bounces to looper automatically when switching modes.</li>
                                <li><strong>Quick Sound Selection</strong> - Hold Function 2 + press chord buttons 1-7 to instantly select waveforms (1=Saw, 2=Sine, 3=Triangle, 4=Square, 5=SawSquare, 6=Piano, 7=Strings).</li>
                                <li><strong>Quick Mode Selection</strong> - Hold Function 3 + press chord buttons to jump to modes (1=Chord, 2=Lead, 3=Arp, 4=Strum, 5=Drum, 6=Looper, 7=Sequencer).</li>
                                <li><strong>Arp Pattern Selection</strong> - Hold Function 1 + press chord buttons 1-6 to select arpeggio patterns (Up, Down, Up/Down, Random, Chord, Manual).</li>
                                <li><strong>Slash Chords</strong> - In bass selection menu (Function 2 menu), choose "/" option. Then select bass note with chord buttons while playing chords.</li>
                                <li><strong>Musical Randomizer</strong> - Select Random waveform for intelligent patch generation with musical tempo and progression.</li>
                                <li><strong>Rhythm Rate Switching</strong> - In modes with rhythm (Arp/Strum), enter Function 3 menu, then press joystick up to access mode settings. Select rhythm rate option.</li>
                                <li><strong>Chord Type Lock</strong> - Hold any chord button + hold joystick in any direction + press Function 2. This locks that chord button's current chord type (Major, Minor, 7th, etc.) so it stays the same even when you change modes or scales. A dot appears on locked chords.</li>
                                <li><strong>Tap Tempo</strong> - Press Function 3 rapidly 4 times to set BPM. Additional taps refine tempo. Exits after 10 seconds of inactivity.</li>
                            </ol>
                            
                            <h4>Calibration Instructions:</h4>
                            <div class="calibration-section">
                                <p><strong>Button Calibration</strong> - Hold Function 1 + Function 3 (NOT Function 2) during power-on. Follow on-screen prompts to press each chord button when requested. This calibrates the analog button detection for your specific unit.</p>
                                <p><strong>Joystick Calibration</strong> - After button calibration completes, move joystick to all four directions and center position as prompted. This ensures accurate joystick direction detection.</p>
                                <p><strong>Clear All Settings</strong> - While the device is running, hold Function 1 + Function 3 for 5 seconds. The display will show "Hold to clear settings" and then "Settings cleared" when complete. This resets all settings to factory defaults, including presets and calibration data.</p>
                            </div>
                        </div>
                    </b-collapse>
                </div>
                <p><b-button variant="es" id="connect"> Connect</b-button></p>
                <dialog id="interfaceDialog">
                    Your device has multiple DFU interfaces. Select one from the list below:
                    <b-form id="interfaceForm" method="dialog">
                        <b-button id="selectInterface" type="submit">Select interface</b-button>
                    </b-form>
                </dialog>
                <div id="usbInfo" hidden="true" style="white-space: pre"></div>
                <div id="dfuInfo"  hidden="true" style="white-space: pre"></div>
                <div>
                    <b-button variant="es" v-b-toggle.collapseHelp>Display Help</b-button>
                    <b-collapse id="collapseHelp">
                        <div class="nested_list">
                            <h2>How to update HiChord:</h2>
                            <ol>
                                <li><p>Connect your HiChord to the Computer, using USB-C. </p></li>
                                <li><p>Turn HiChord On. Press and Hold all three menu buttons (Grey, Yellow, and Red) until HiChord screen says "Entering DFU Mode".</p></li>
                                <li><p>Click the Connect button at the top of the page.</p></li>
                                <li><p>Select, "Daisy Bootloader - Paired".</p></li>
                                 <li><p>Click "Update HiChord!", and wait for the progress bar to finish.</p></li>
                             
                        
                            </ol>
                            <p>

For Windows users having issues with updating, you may need to update your USB driver. See the 
            <a href="https://cdn.shopify.com/s/files/1/0837/6306/9223/files/HICHORD_UPDATE_ON_WINDOWS_1.pdf?v=1741741644" target="_blank">
                Windows Update Instructions PDF
            </a> for detailed steps.

                
                            </p>
                        </div>
                    </b-collapse>
                    <b-collapse id="collapseHelp">
                        <div class="nested_list">
                            <h1>Requirements</h1>
                            <p>In order to use this, you will need:</p>
                            <ul>
                                <li>
                                    <p>An up-to-date version of Chrome, at least version 61 or newer</p>
                                </li>
                                <li>
                                    <p> HiChord + USB-C Cable.</p>
                                </li>
                            </ul>
                        </div>
                    </b-collapse>
                </div>
            </div>
        </b-row>
        <b-row align="between">
            <b-col align="center" class="app_column">
                <b-container>
                    <b-row class="p-2">
                        <legend>Update to HiChord REV1.8</legend>
                        <div><b-button variant="es" id="blink"  :disabled="no_device">Update HiChord!</b-button></div>
                    </b-row>
                    <hr>
                    <!-- Hidden Platform and Program Selection Section -->
                    <b-row class="p-2" hidden>
                        <legend> Or select a platform and a program from the menu below.</legend>
                        <b-form-select placeholder="Platform" v-model="sel_platform" textContent="Select a platform" id="platformSelector">
                            <template v-slot:first>
                                <b-form-select-option :value="null" disabled>-- Platform --</b-form-select-option>
                            </template>
                            <option v-for="platform in platforms" :value="platform">{{platform}}</option>
                        </b-form-select>
                        <b-form-select v-model="sel_example" id="firmwareSelector" required @change="programChanged">
                            <template v-slot:first>
                                <b-form-select-option :value="null" disabled>-- Example --</b-form-select-option>
                            </template>
                            <b-form-select-option v-for="example in platformExamples" v-bind:key="example.name" :value="example">{{example.name}}</b-form-select-option>
                        </b-form-select>
                    </b-row>
                    <hr>
                    <!-- Hidden File Selection Section -->
                    <b-row class="p-2" hidden>
                        <legend> Or select a file from your computer</legend>
                            <b-form-file
                                id="firmwareFile"
                                v-model="firmwareFile"
                                :state="Boolean(firmwareFile)"
                                placeholder="Choose or drop a file..."
                                drop-placeholder="Drop file here..."
                            ></b-form-file>
                    </b-row>
                </b-container>
            </b-col>
        </b-row>
        <b-row>
            <b-col align="center" class="app_column">
                <b-container align="center">
                    <legend>Progress</legend>
                    <!-- Hidden "Program" Button -->
                    <b-button id="download" variant='es' :disabled="no_device || !sel_example" hidden> Program</b-button>

                    <br> <br>
                    <!-- Hidden "Advanced..." Button -->
                    <b-button variant="es" v-b-toggle.collapseAdvanced hidden>Advanced...</b-button>
                    <b-collapse id="collapseAdvanced">
                        <br> 
                        <div> 
                            <b-button variant="es" id="bootloader"  :disabled="no_device">Flash Bootloader Image</b-button> 
                        </div>                        
                    </b-collapse>

                    <div class="log" id="downloadLog"></div>            
                    <br><br>
                    <div v-if="sel_example||firmwareFile" >            
                        <div v-if="displaySelectedFile">
                        <!--<h3 class="info">Name: {{sel_example.name}}</h3>-->
                        <!--<li>Description: {{sel_example.description}}</li>-->
                        <!--<h3 class="info">File Location: {{sel_example.filepath}} </h3>-->
                        </div>
                    <br>
                    </div>
                    <div><div id = "readme"></div> </div>
                </b-container>
            </b-col>
        </b-row>
    </b-row>        

    </b-container>
    `,
    data: data,
    computed: {
        platformExamples: function () {
            
            return this.examples.filter(example => example.platform === this.sel_platform)
        }
    },
    created() {
        console.log("Page Created")
    },
    mounted() {
        var self = this
        console.log("Mounted Page")
        //var fpath = getRootUrl().concat("bin/examples.json");
        //gatherExampleData()
        // setTimeout(function(){
        //     self.importExamples(buffer)
        // }, 1000)
        this.importExamples()
    },
    methods: {
        importExamples() {
            // var self = this
            // const unique_platforms = [...new Set(data.map(obj => obj.platform))] 
            // self.examples = data
            // self.platforms = unique_platforms
            // New code below:
            // Get Source list as data 
            var self = this // assign self to 'this' before nested function calls...
            var src_url = getRootUrl().split("?")[0].concat("data/sources.json") //need to strip out query string
            var raw = new XMLHttpRequest();
            raw.open("GET", src_url, true);
            raw.responseType = "text"
            raw.onreadystatechange = function ()
            {
                if (this.readyState === 4 && this.status === 200) {
                    var obj = this.response;
                    buffer = JSON.parse(obj);
                    buffer.forEach( function(ex_src) {
                        // Launch another request with async function to load examples from the 
                        // specified urls 
                        // This will fill examples directly, and replace the importExamples/timeout situation.
                        var ext_raw = new XMLHttpRequest();
                        ext_raw.open("GET", ex_src.data_url, true);
                        ext_raw.responseType = "text"
                        ext_raw.onreadystatechange = function ()
                        {
                            // This response will contain example data for the specified source.
                            if (this.readyState === 4 && this.status === 200) {
                                var ext_obj = this.response;
                                ex_buffer = JSON.parse(ext_obj);
                                const unique_platforms = [...new Set(ex_buffer.map(obj => obj.platform))]
                                ex_buffer.forEach( function(ex_dat) {
                                    //  Add "source" to example data
                                    ex_dat.source = ex_src
                                    
                                    self.examples.sort(function (i1, i2){ 
                                        return i1.name.toLowerCase() < i2.name.toLowerCase() ? -1 : 1
                                    })
                                    self.examples.push(ex_dat)
                                })
                                unique_platforms.forEach( function(u_plat) {
                                    if (!self.platforms.includes(u_plat)) {
                                        self.platforms.push(u_plat)
                                    }
                                })
                            }
                        }
                        ext_raw.send(null)

                            // var self = this
                            // const unique_platforms = [...new Set(data.map(obj => obj.platform))] 
                            // self.examples = data
                            // self.platforms = unique_platforms
                    })
                }
            }
            raw.send(null)
        },
        programChanged(){
            var self = this

            // Read new file
            self.firmwareFileName = self.sel_example.name
            this.displaySelectedFile = true;
            var srcurl = self.sel_example.source.repo_url
            //var expath = srcurl.substring(0, srcurl.lastIndexOf("/") +1).extend;
            var expath = srcurl.concat(self.sel_example.filepath)
            readServerFirmwareFile(expath).then(buffer => {
                firmwareFile = buffer
            })
        },
    },
    watch: {
        firmwareFile(newfile){
            firmwareFile = null;
            this.displaySelectedFile = true;
            // Create dummy example struct
            // This updates sel_example to enable the Program button when a file is loaded
            var new_example = {
                name: newfile.name,
                description: "Imported File",
                filepath: null,
                platform: null
            }
            this.sel_example = new_example;
            let reader = new FileReader();
            reader.onload = function() {
                this.firmwareFile = reader.result;
                firmwareFile = reader.result;
            }
            reader.readAsArrayBuffer(newfile);
        },
        examples(){
            var self = this

            //grab the blink firmware file
          var blink_example = self.examples.filter(example => example.name.toLowerCase() === "blink" && example.platform === "seed")[0]

    // We no longer need blink_example.source.repo_url or blink_example.filepath here.
    // Just read from the local data folder.
    var root = getRootUrl().split("?")[0];
    var localBlinkPath = root + "data/REV 1.9 Beta (1 fix).bin";
    
    readServerFirmwareFile(localBlinkPath, false).then(buffer => {
        blinkFirmwareFile = buffer
    });
    
            // grab the bootloader firmware file
            var srcurl = blink_example.source.bootloader_url
            readServerFirmwareFile(srcurl, false).then(buffer => {
                bootloaderFirmwareFile = buffer
            })

            //parse the query strings
            var searchParams = new URLSearchParams(getRootUrl().split("?")[1])
            
            var platform = searchParams.get('platform')
            var name = searchParams.get('name')
            if(platform != null && self.examples.filter(ex => ex.platform === platform)){
                self.sel_platform = platform

                if(name != null){
                    var ex = self.examples.filter(ex => ex.name === name && ex.platform === platform)[0]
                    if(ex != null){
                        self.sel_example = ex
                        this.programChanged()
                    }    
                }
            }
        }
    }
})
