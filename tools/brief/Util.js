class Util {
    static clean_yy(blob) {
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
}


module.exports = Util;
if (!global["__program_main"]) if (!global["__program_warn"]) {global["__program_warn"]=1;console.error("Please execute the program by running main.js");}