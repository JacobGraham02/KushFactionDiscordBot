import fs from "fs";
import path from "path";

type Locale = Record<string, any>;

/**
 * The i18next library is used to switch localisation for the application. The default localisation is American English
 */
export default class I18nLocalisation {
    private locale: Locale = {};
    private currentLanguage: string = "en";

    constructor(language: string = "en") {

    }

    /**
     * Set the current language and attempt to load its locale file. The default language is American English ("en")
     * @param language a string of the language you want to load into the application
     */
    public setLanguage(language: string): void {
        const localePath = path.join(__dirname, `../locales/${language}.json`);

        if (!fs.existsSync(localePath)) {
            throw new Error(`The locale file for language ${language} was not found`);
        }

        try {
            this.locale = JSON.parse(fs.readFileSync(localePath, "utf8"));
        } catch (error) {
            throw error;
        }

        this.currentLanguage = language;
    }

    /**
     * Get specified translated text by key
     * @param key the key to the translation as represented in the JSON file (e.g., greetings.hello)
     * @param fallback A fallback string if the key is not found
     * @return The translated text as it exists in the JSON file
     */
    public translate(key: string, fallback: string = ""): string {
        const keys = key.split(".");
        let result: any = this.locale;

        for (const key of keys) {
            result = result[key];
            if (result === undefined) {
                return fallback;
            }
        }

        return result;
    }

    /**
     * Return the language the application is set to
     */
    public getLanguage(): string {
        return this.currentLanguage;
    }
}
