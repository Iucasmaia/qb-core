class Locale {
    constructor(opts) {
        this.fallback = opts.fallbackLang ? new Locale({ 
            warnOnMissing: false, 
            phrases: opts.fallbackLang.phrases 
        }) : null;

        this.warnOnMissing = typeof opts.warnOnMissing !== 'boolean' ? true : opts.warnOnMissing;
        this.phrases = {};
        this.extend(opts.phrases || {});
    }

    static translateKey(phrase, subs = {}) {
        if (typeof phrase !== 'string') {
            throw new Error('TypeError: translateKey function expects argument to be a string');
        }

        let result = phrase;
        for (const [k, v] of Object.entries(subs)) {
            result = result.replace(`%{${k}}`, v);
        }
        return result;
    }

    extend(phrases, prefix = "") {
        for (const [key, phrase] of Object.entries(phrases)) {
            const prefixKey = prefix ? `${prefix}.${key}` : key;

            if (typeof phrase === 'object') {
                this.extend(phrase, prefixKey);
            } else {
                this.phrases[prefixKey] = phrase;
            }
        }
    }

    clear() {
        this.phrases = {};
    }

    replace(phrases = {}) {
        this.clear();
        this.extend(phrases);
    }

    locale(newLocale) {
        if (newLocale) {
            this.currentLocale = newLocale;
        }
        return this.currentLocale;
    }

    t(key, subs = {}) {
        let phrase;
        let result;

        if (typeof this.phrases[key] === 'string') {
            phrase = this.phrases[key];
        } else {
            if (this.warnOnMissing) {
                console.warn(`Warning: Missing phrase for key: "${key}"`);
            }
            if (this.fallback) {
                return this.fallback.t(key, subs);
            }
            result = key;
        }

        if (typeof phrase === 'string') {
            result = Locale.translateKey(phrase, subs);
        }

        return result;
    }

    has(key) {
        return this.phrases[key] !== undefined;
    }

    delete(phraseTarget, prefix = "") {
        if (typeof phraseTarget === 'string') {
            delete this.phrases[phraseTarget];
        } else {
            for (const [key, phrase] of Object.entries(phraseTarget)) {
                const prefixKey = prefix ? `${prefix}.${key}` : key;

                if (typeof phrase === 'object') {
                    this.delete(phrase, prefixKey);
                } else {
                    delete this.phrases[prefixKey];
                }
            }
        }
    }
}

global.Locale = Locale