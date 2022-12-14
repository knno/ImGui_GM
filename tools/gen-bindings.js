/* node.js script to do a few things:
   1. read wrapper functions from imgui_gm.cpp
   2. add function definition resources to ImGui_GM.yy
   3. create bound functions that call to ImGui in ImGui.gml  
   ⚠️ This script directly modifies ImGui_GM.yy and ImGui.gml, so it is recomended you use source control! ⚠️

   Notes:
   - Use GMFUNC to mark functions as wrappers
   - Arguments in wrapper functions must be read by using any of the YYGet_ functions
   - Default argument values should be defined as GMDEFAULT below the argument assignment
   - ImGui.gml must contain a @section for "Bindings"
*/

// Spacing used for functions in ImGui.gml
const SPACING = "    ";

// If enabled, modified files are saved with a ".test" extension
const USE_TEST = false;

const fs = require("node:fs"), path = require("node:path"), reserved = ["x", "y", "continue", "return"];
function clean(blob) {
        const removal = [];
        for(let i = 0; i < blob.length; i++) {
            if (blob[i] === ",") {
                if (i + 1 >= blob.length) {
                    removal.push(i);
                    continue;
                }

                let base = i + 1;
                while (base < blob.length && blob.charCodeAt(base) <= 32) {
                    if (++base >= blob.length) {
                        removal.push(i);
                        continue;
                    }
                }

                const char = blob[base];
                if (char === "]" || char === "}") {
                    removal.push(i);
                }
            }
        }

        let cleaned = blob;
        for(let i = 0; i < removal.length; i++) {
            const pos = removal[i] - i;
            cleaned = cleaned.slice(0, pos) + cleaned.slice(pos + 1);
        }
        return cleaned;
}

try {
    (function(input) {
        const missing = input.reduce((prev, e) => prev ?? (fs.existsSync(e) ? prev : e), undefined);
        if (missing) {
            throw `Could not find file: ${missing}`;
        }
        const content = input.map(e => fs.readFileSync(e, {encoding: "utf-8"}).split("\n"));

        // imgui_gm.cpp
        // Collects functions defined with GMFUNC along with arguments using YYGet_ functions and GMDEFAULT for default values in GM
        const wrappers = content[0], found = [];
        for(let i = 0; i < wrappers.length; i++) {
            const line = wrappers[i].trim();
            const ind = line.indexOf("GMFUNC");
            if (ind === -1 || line[0] === "#") continue;

            // Wrapper Name
            let start = line.indexOf("(", ind);
            let end = line.indexOf(")", ind);
            if (start === -1 || end === -1) throw `Could not get function name argument from GMFUNC at line ${i + 1}`;
            const name = line.slice(start + 1, end);

            // Wrapper Contents
            let end_line = i;
            while (!wrappers[end_line].trim().startsWith("return;")) {
                if (++end_line >= wrappers.length) {
                    throw `Could not find end of GMFUNC contents at line ${i + 1}`;
                }
            }

            // Arguments
            let args = [];
            for(let j = i + 1; j < end_line; j++) {
                const line = wrappers[j].trim();
                const ind = line.indexOf("YYGet");
                if (ind === -1) continue;
                
                let start = line.indexOf("(", ind);
                let end = line.indexOf(")", ind);
                if (start === -1 || end === -1) throw `Could not arguments for YYGet call at line ${j + 1}`;

                const func = line.slice(ind, start);
                const func_args = line.slice(start + 1, end).split(",").map(e => e.trim());
                const arg_ind = parseInt(func_args[1]);

                // Name
                let copy = line.slice(0, ind);
                const assign = copy.indexOf("=");
                if (assign > -1) copy = copy.slice(0, assign).trim();
                let arg_name = copy.slice(copy.lastIndexOf(" ")).trim();
                if (reserved.includes(arg_name)) arg_name = "_" + arg_name;

                let def = undefined;
                const next = wrappers[j + 1].trim();
                if (next.startsWith("GMDEFAULT")) {
                    let start = next.indexOf("(");
                    let end = next.indexOf(")");
                    if (start === -1 || end === -1) throw `Could not default value argument for GMDEFAULT call at line ${j + 1}`;
                    def = next.slice(start + 1, end);
                }

                args[arg_ind] = {
                    Name: arg_name,
                    Func: func,
                    Def: def
                }
            }

            // ImGui call
            let call = undefined;
            for (let j = end_line; j > i; j--) {
                const line = wrappers[j].trim();
                const ind = line.indexOf("ImGui::");
                if (ind === -1 || line.startsWith("//")) continue;

                const start = ind + 7; // ImGui::.length
                const end = line.indexOf("(", start);
                if (end == -1) throw `Could not find end of ImGui:: call at line ${j + 1}`;
                call = line.slice(start, end);
            }
            if (!call) throw `Could not find call to ImGui function in GMFUNC at line ${i + 1}`;
            
            console.log(`Found ${name} with ${args.length} arguments at line ${i + 1} (ImGui::${call})`);
            found.push({
                Name: name,
                Call: call,
                Arguments: args
            });
        }

        // ImGui_GM.yy
        // This sorta sucks, but I don't really want to mess with parsing .yy files; so it works for the time being
        const resources = content[1];
        for(let i = 0; i < resources.length; i++) {
            const line = resources[i].trim();
            if (!line.includes('"files"')) continue;

            let end = -1;
            for (j = i + 1; j < resources.length; j++) {
                const next = resources[j].trim();
                if (next.includes("],")) {
                    if (next.length > 2) continue;
                    end = j;
                    break;
                }
            }
            if (end === -1) throw `Could not find end of "files" member at line ${i + 1}`;

            const resource = JSON.parse(clean(resources.slice(i + 1, end).join("\n").trim()));
            if (!resource) throw `Could not read "files" member, array is empty or does not contain GMResource for ImGui_GM`;
            resource.functions = resource.functions.filter(e => {
                return !found.find(f => f.Name === e?.name);
            });

            // Add new functions
            found.forEach(func => {
                resource.functions.push({
                    resourceType: "GMExtensionFunction",
                    resourceVersion: "1.0",
                    name: func.Name,
                    externalName: func.Name,
                    help: "",
                    documentation: "",
                    kind: 1,
                    hidden: true,
                    returnType: 1,
                    argCount: 0,
                    args: []
                })
            });

            // Write to file
            let resources_write = resources.slice(0, i).concat(`  "files": [\n    ${JSON.stringify(resource)}\n  ],`).concat(resources.slice(end + 1));
            console.log(resources_write);
            fs.writeFileSync(input[1] + (USE_TEST ? ".test" : ""), resources_write.join("\n"));
            break;
        }
        
        // ImGui.gml
        // Creates binding functions for ImGui struct in @section Binds
        const binds = content[2], sections = [];

        let current_section = undefined;
        for(let i = 0; i < binds.length; i++) {
            const line = binds[i].trim();
            const ind = line.indexOf("@section");
            if (ind === -1 || !line.startsWith("///")) continue;

            if (current_section) {
                current_section.End = i;
                sections.push(current_section);
            }

            const name = line.slice(ind + "@section".length).trim();
            current_section = {
                Name: name,
                Start: i,
                End: -1
            };
        }
        
        if (current_section) {
            if (current_section.End === -1) current_section.End = binds.length;
            sections.push(current_section);
        } else {
            if (sections.length === 0) throw `Could not update ImGui.gml, could not find any sections`;
        }

        const section = sections.find(e => e.Name.toLowerCase() === "binds");
        if (!section) throw `Could not update ImGui.gml, could not find "Binds" section`;
        
        let binds_content = [];
        found.forEach(func => {
            let line = [], args = func.Arguments;

            line.push(`/// @function ${func.Call}(${args.map(e => e.Name).join(", ")})`);
            args.forEach(e => {
                line.push(`/// @argument {${e.Func.slice("YYGet".length)}} ${e.Def ? `[${e.Name}=${e.Def}]` : e.Name}`);
            });
            line.push(`static ${func.Call} = function(${args.map(e => `${e.Name}${e.Def ? `=${e.Def}` : ""}`).join(", ")}) {`);
            line.push(`   return ${func.Name}(${args.map(e => e.Name).join(", ")});`);
            line.push(`}\n`);

            binds_content.push(line.map(e => `${SPACING}${e}`).join("\n"));
        });

        let binds_write = binds.slice(0, section.Start).concat(`${SPACING}/// @section Binds\n${binds_content.join("\n")}`).concat(binds.slice(section.End));
        fs.writeFileSync(input[2] + (USE_TEST ? ".test" : ""), binds_write.join("\n"));

        console.log(`Successfully wrote ${found.length} functions`);
    })(["dll/imgui_gm.cpp", "extensions/ImGui_GM/ImGui_GM.yy", "scripts/ImGui/ImGui.gml"].map(e => path.normalize(e)));
    process.exit(0);
} catch (e) {
    console.error(`An error has occured in gen-bindings:\n- ${e}`);
    process.exit(1);
}
