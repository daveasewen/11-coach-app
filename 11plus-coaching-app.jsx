import { useState, useEffect, useRef } from "react";

const VERSION = "1.6";

const BASELINE = {
  overall: { score: 108, total: 200, pct: 54 },
  domains: [
    { name: "Vocabulary", score: 21, total: 54, pct: 39, priority: "P1", gap: 46 },
    { name: "Comprehension", score: 26, total: 44, pct: 59, priority: "P2", gap: 26 },
    { name: "Maths", score: 31, total: 52, pct: 60, priority: "P3", gap: 25 },
    { name: "NVR", score: 21, total: 36, pct: 58, priority: "P3", gap: 27 },
    { name: "Verbal Reasoning", score: 9, total: 14, pct: 64, priority: "P3", gap: 21 },
  ],
};

// Legacy flat keys — used only for one-time migration of existing data
const STORAGE_KEYS = {
  leitnerBoxes: "11plus:leitner-boxes-v1",
  sessionHistory: "11plus:session-history-v1",
  streakData: "11plus:streak-data-v1",
};

// ─── PROFILES (v1.6) ─────────────────────────────────────────────────────────
const PROFILES_KEY      = "11plus:profiles";
const ACTIVE_PROFILE_KEY = "11plus:active-profile";

const PROFILE_AVATARS = ["🦁","🐯","🦊","🦅","🐬","🦋","🦄","🐉","⭐","🌟","🎯","🚀"];
const PROFILE_COLOURS = ["#e85d26","#2355a0","#6b3fa0","#2d7a52","#c9963a","#c0392b","#16a085","#8e44ad"];

function makeProfileId() {
  return "u" + Math.random().toString(36).slice(2, 9);
}

function getUserStorageKeys(userId) {
  return {
    leitnerBoxes:   `11plus:user:${userId}:leitner-boxes-v1`,
    sessionHistory: `11plus:user:${userId}:session-history-v1`,
    streakData:     `11plus:user:${userId}:streak-data-v1`,
  };
}

// ─── VOCAB BANK v1.1 — schema includes simpleDefinition ──────────────────────
const VOCAB_BANK = [
  { word: "abate", definition: "To become less intense or widespread", simpleDefinition: "To get smaller or less strong", synonyms: ["diminish", "subside", "lessen", "decrease"], antonyms: ["intensify", "increase", "escalate"], difficulty: 3, pos: "verb", example: "The storm began to abate by morning." },
  { word: "abundance", definition: "A very large quantity; more than enough", simpleDefinition: "Having loads of something — way more than you need", synonyms: ["plenty", "profusion", "surplus", "wealth"], antonyms: ["scarcity", "lack", "shortage"], difficulty: 2, pos: "noun", example: "There was an abundance of fruit in the orchard." },
  { word: "acquainted", definition: "Having knowledge or experience of something; familiar with", simpleDefinition: "When you know about something or have met someone before", synonyms: ["familiar", "versed", "informed", "aware"], antonyms: ["unfamiliar", "ignorant", "unaware"], difficulty: 2, pos: "adjective", example: "She was well acquainted with the rules." },
  { word: "affable", definition: "Friendly, good-natured, and easy to talk to", simpleDefinition: "Really easy to talk to and friendly with everyone", synonyms: ["friendly", "amiable", "genial", "pleasant"], antonyms: ["unfriendly", "aloof", "cold", "surly"], difficulty: 3, pos: "adjective", example: "The affable teacher was popular with students." },
  { word: "aghast", definition: "Filled with horror or shock", simpleDefinition: "So shocked you can hardly believe what you've seen or heard", synonyms: ["horrified", "appalled", "shocked", "stunned"], antonyms: ["calm", "unsurprised", "indifferent"], difficulty: 3, pos: "adjective", example: "She was aghast at the news of the accident." },
  { word: "alleviate", definition: "To make pain, suffering, or a problem less severe", simpleDefinition: "To make something bad feel a bit better or hurt less", synonyms: ["ease", "relieve", "reduce", "lessen"], antonyms: ["aggravate", "worsen", "intensify"], difficulty: 3, pos: "verb", example: "The medicine helped to alleviate his pain." },
  { word: "amiable", definition: "Having a friendly and pleasant manner", simpleDefinition: "Cheerful, kind and nice to be around", synonyms: ["friendly", "affable", "genial", "pleasant"], antonyms: ["unfriendly", "hostile", "disagreeable"], difficulty: 3, pos: "adjective", example: "She gave an amiable smile to the newcomer." },
  { word: "anguish", definition: "Severe mental or physical pain or suffering", simpleDefinition: "A really deep, painful feeling of sadness or hurt", synonyms: ["agony", "torment", "distress", "suffering"], antonyms: ["comfort", "joy", "relief", "peace"], difficulty: 3, pos: "noun", example: "She felt deep anguish after hearing the news." },
  { word: "apathetic", definition: "Showing or feeling no interest, enthusiasm, or concern", simpleDefinition: "When you really don't care about something at all", synonyms: ["indifferent", "listless", "uninterested", "passive"], antonyms: ["enthusiastic", "interested", "eager", "passionate"], difficulty: 3, pos: "adjective", example: "The students were apathetic about the new rule." },
  { word: "apprehensive", definition: "Anxious or fearful that something bad may happen", simpleDefinition: "Feeling nervous and a bit scared about what might happen", synonyms: ["anxious", "nervous", "worried", "uneasy"], antonyms: ["confident", "calm", "assured", "fearless"], difficulty: 3, pos: "adjective", example: "She felt apprehensive before the interview." },
  { word: "arduous", definition: "Involving strenuous effort; very difficult", simpleDefinition: "Really hard work that takes a lot of energy", synonyms: ["difficult", "strenuous", "demanding", "laborious"], antonyms: ["easy", "effortless", "simple"], difficulty: 3, pos: "adjective", example: "The arduous climb took them all day." },
  { word: "ascent", definition: "A climb or walk to the top of something; a rise", simpleDefinition: "Going up — like climbing a hill or stairs", synonyms: ["climb", "rise", "scaling", "escalation"], antonyms: ["descent", "fall", "drop"], difficulty: 2, pos: "noun", example: "The ascent of the mountain was challenging but rewarding." },
  { word: "authentic", definition: "Genuine; known to be true and not a copy", simpleDefinition: "The real thing — not a fake or a copy", synonyms: ["genuine", "real", "legitimate", "original"], antonyms: ["fake", "false", "imitation", "counterfeit"], difficulty: 2, pos: "adjective", example: "The museum displayed authentic Roman coins." },
  { word: "baleful", definition: "Threatening harm; menacing", simpleDefinition: "Looking dangerous and scary, like trouble is coming", synonyms: ["menacing", "threatening", "sinister", "ominous"], antonyms: ["benign", "friendly", "harmless"], difficulty: 3, pos: "adjective", example: "The villain cast a baleful glance at the hero." },
  { word: "benevolent", definition: "Well-meaning and kindly; generous", simpleDefinition: "Very kind and wanting to help people", synonyms: ["kind", "generous", "charitable", "philanthropic"], antonyms: ["malevolent", "cruel"], difficulty: 3, pos: "adjective", example: "The benevolent donor gave a large sum to the school." },
  { word: "benign", definition: "Gentle and kindly; not dangerous or harmful", simpleDefinition: "Safe and harmless — nothing to worry about", synonyms: ["harmless", "gentle", "mild", "kind"], antonyms: ["malignant", "harmful", "dangerous", "malevolent"], difficulty: 3, pos: "adjective", example: "The doctor confirmed the growth was benign." },
  { word: "bewildered", definition: "Perplexed and confused; baffled", simpleDefinition: "So confused you don't know what is going on", synonyms: ["confused", "perplexed", "baffled", "puzzled"], antonyms: ["lucid", "certain", "clear-headed"], difficulty: 2, pos: "adjective", example: "He was bewildered by the complex instructions." },
  { word: "boisterous", definition: "Noisy, energetic, and cheerful", simpleDefinition: "Very loud, lively and full of energy — in a fun way", synonyms: ["lively", "rowdy", "noisy", "exuberant"], antonyms: ["quiet", "calm"], difficulty: 3, pos: "adjective", example: "The boisterous children ran across the playground." },
  { word: "brazen", definition: "Bold and shameless; without embarrassment", simpleDefinition: "Acting cheeky or rude without caring what anyone thinks", synonyms: ["bold", "shameless", "impudent", "audacious"], antonyms: ["shy", "ashamed", "modest", "timid"], difficulty: 3, pos: "adjective", example: "She made a brazen attempt to cheat during the exam." },
  { word: "breach", definition: "An act of breaking a rule or agreement; a gap or break", simpleDefinition: "Breaking a rule, or a gap in something like a wall or fence", synonyms: ["violation", "break", "infringement", "gap"], antonyms: ["observance", "compliance", "closure"], difficulty: 3, pos: "noun", example: "He was accused of a breach of trust." },
  { word: "calamity", definition: "An event causing great and often sudden damage or distress", simpleDefinition: "A terrible disaster that causes a lot of harm", synonyms: ["disaster", "catastrophe", "tragedy", "misfortune"], antonyms: ["blessing", "fortune", "godsend"], difficulty: 3, pos: "noun", example: "The flood was a calamity for the entire village." },
  { word: "candid", definition: "Truthful and straightforward; honest", simpleDefinition: "Saying exactly what you think in an honest, open way", synonyms: ["honest", "frank", "open", "forthright"], antonyms: ["evasive", "dishonest", "secretive", "guarded"], difficulty: 3, pos: "adjective", example: "She gave a candid account of what had happened." },
  { word: "chastised", definition: "Rebuked or punished severely", simpleDefinition: "Told off or punished quite firmly", synonyms: ["scolded", "reprimanded", "rebuked", "punished"], antonyms: ["praised", "rewarded", "commended"], difficulty: 3, pos: "verb", example: "The teacher chastised the student for talking in class." },
  { word: "conceited", definition: "Excessively proud of oneself; vain", simpleDefinition: "Thinking you are better than everyone else and showing it", synonyms: ["arrogant", "vain", "self-important", "smug"], antonyms: ["humble", "modest", "self-effacing"], difficulty: 2, pos: "adjective", example: "He was too conceited to accept any criticism." },
  { word: "concerted", definition: "Planned or carried out together; jointly arranged", simpleDefinition: "When everyone works together on the same thing at the same time", synonyms: ["combined", "coordinated", "joint", "united"], antonyms: ["individual", "uncoordinated", "solo"], difficulty: 3, pos: "adjective", example: "They made a concerted effort to finish on time." },
  { word: "confiscate", definition: "To take or seize someone's property by authority", simpleDefinition: "When a teacher or adult takes something away from you", synonyms: ["seize", "impound", "commandeer", "appropriate"], antonyms: ["return", "restore"], difficulty: 2, pos: "verb", example: "The teacher confiscated the mobile phone." },
  { word: "conspicuous", definition: "Standing out so as to be clearly visible; attracting attention", simpleDefinition: "Easy to spot — stands out and gets noticed", synonyms: ["noticeable", "obvious", "prominent", "evident"], antonyms: ["inconspicuous", "hidden", "subtle", "invisible"], difficulty: 3, pos: "adjective", example: "She wore a conspicuous bright red hat." },
  { word: "contemplated", definition: "Thought about something carefully; considered", simpleDefinition: "Spent time thinking hard about something before deciding", synonyms: ["considered", "pondered", "mused", "deliberated"], antonyms: ["ignored", "dismissed", "overlooked"], difficulty: 3, pos: "verb", example: "He contemplated his next move for several minutes." },
  { word: "corrosive", definition: "Tending to cause damage or destruction; destructive", simpleDefinition: "Something that slowly eats away and damages things", synonyms: ["destructive", "caustic", "eroding", "damaging"], antonyms: ["protective", "preserving", "harmless"], difficulty: 3, pos: "adjective", example: "The corrosive acid ate through the metal." },
  { word: "credibility", definition: "The quality of being trusted and believed in", simpleDefinition: "Whether people trust you and believe what you say", synonyms: ["trustworthiness", "reliability", "integrity", "reputation"], antonyms: ["dishonesty", "unreliability", "doubt"], difficulty: 3, pos: "noun", example: "Her credibility suffered after the lie was exposed." },
  { word: "crucial", definition: "Decisive or critical in importance", simpleDefinition: "Really, really important — can't be missed", synonyms: ["vital", "critical", "essential", "pivotal"], antonyms: ["insignificant", "trivial", "unimportant"], difficulty: 2, pos: "adjective", example: "It is crucial that we arrive on time." },
  { word: "curtail", definition: "To reduce in extent or quantity; to impose a restriction", simpleDefinition: "To cut something short or stop it from growing", synonyms: ["reduce", "restrict", "limit", "trim"], antonyms: ["extend", "expand", "increase"], difficulty: 3, pos: "verb", example: "The council decided to curtail spending." },
  { word: "delude", definition: "To impose a false belief on someone; to deceive", simpleDefinition: "To trick someone into believing something that isn't true", synonyms: ["deceive", "mislead", "fool", "trick"], antonyms: ["enlighten", "reveal", "inform"], difficulty: 3, pos: "verb", example: "He was deluding himself about his chances of winning." },
  { word: "deluge", definition: "A severe flood; an overwhelming number of things", simpleDefinition: "A huge flood, or way too much of something all at once", synonyms: ["flood", "torrent", "downpour", "avalanche"], antonyms: ["trickle", "drought", "shortage"], difficulty: 3, pos: "noun", example: "The office received a deluge of complaints." },
  { word: "deploy", definition: "To move into position for action; to use effectively", simpleDefinition: "To send something or someone to where they are needed", synonyms: ["position", "station", "use", "utilise"], antonyms: ["withdraw", "retreat", "recall"], difficulty: 3, pos: "verb", example: "The company decided to deploy its best team." },
  { word: "deranged", definition: "Suffering from a mental illness; driven to strange behaviour", simpleDefinition: "Acting very strangely, almost like their mind isn't working right", synonyms: ["mad", "insane", "unbalanced", "disturbed"], antonyms: ["sane", "rational", "balanced"], difficulty: 3, pos: "adjective", example: "The villain appeared completely deranged." },
  { word: "destitute", definition: "Without the basic necessities of life; extremely poor", simpleDefinition: "So poor that you don't have food, clothes or a home", synonyms: ["impoverished", "penniless", "poverty-stricken", "bankrupt"], antonyms: ["wealthy", "affluent", "prosperous"], difficulty: 3, pos: "adjective", example: "The family was left destitute after the fire." },
  { word: "dilapidated", definition: "In a state of disrepair or ruin", simpleDefinition: "Old and falling apart — needs lots of fixing", synonyms: ["rundown", "crumbling", "decrepit", "derelict"], antonyms: ["sound", "pristine", "renovated"], difficulty: 3, pos: "adjective", example: "The dilapidated cottage had not been lived in for years." },
  { word: "diligent", definition: "Having or showing careful and persistent work effort", simpleDefinition: "Working hard and carefully without giving up", synonyms: ["hardworking", "industrious", "thorough", "conscientious"], antonyms: ["lazy", "idle", "negligent", "careless"], difficulty: 2, pos: "adjective", example: "She was a diligent student who always completed her work." },
  { word: "disarray", definition: "A state of disorganisation or untidiness", simpleDefinition: "A total mess — nothing is where it should be", synonyms: ["disorder", "chaos", "confusion", "mess"], antonyms: ["order", "organisation", "tidiness"], difficulty: 3, pos: "noun", example: "The room was in complete disarray after the party." },
  { word: "dismal", definition: "Causing a mood of gloom or depression; pitifully bad", simpleDefinition: "Really gloomy, miserable or just terribly bad", synonyms: ["gloomy", "dreary", "bleak", "cheerless"], antonyms: ["cheerful", "bright", "sunny", "encouraging"], difficulty: 2, pos: "adjective", example: "The weather was so dismal that everyone stayed inside." },
  { word: "elated", definition: "Feeling great happiness and excitement", simpleDefinition: "Feeling on top of the world — super happy and excited", synonyms: ["thrilled", "overjoyed", "ecstatic", "jubilant"], antonyms: ["miserable", "dejected", "despondent", "sad"], difficulty: 2, pos: "adjective", example: "She was elated when she heard she had passed." },
  { word: "elude", definition: "To escape from or avoid; to be difficult to understand", simpleDefinition: "To get away from something or someone, or to be hard to find", synonyms: ["avoid", "escape", "evade", "dodge"], antonyms: ["confront", "face", "meet"], difficulty: 3, pos: "verb", example: "The answer continued to elude him." },
  { word: "eminent", definition: "Famous and respected, especially in a particular field", simpleDefinition: "Really well-known and looked up to by lots of people", synonyms: ["distinguished", "renowned", "prominent", "respected"], antonyms: ["unknown", "obscure", "insignificant"], difficulty: 3, pos: "adjective", example: "An eminent scientist visited the school." },
  { word: "feral", definition: "In a wild state; resembling a wild animal", simpleDefinition: "Wild and untamed — like an animal that has never been tamed", synonyms: ["wild", "savage", "untamed", "fierce"], antonyms: ["tame", "domestic", "civilised"], difficulty: 3, pos: "adjective", example: "Feral cats roamed the old neighbourhood." },
  { word: "ferocity", definition: "The state of being very fierce or violent; savageness", simpleDefinition: "Being really fierce, powerful and scary", synonyms: ["fierceness", "savagery", "brutality", "intensity"], antonyms: ["gentleness", "mildness", "tenderness"], difficulty: 3, pos: "noun", example: "The ferocity of the storm took everyone by surprise." },
  { word: "feasible", definition: "Possible to do easily or conveniently; achievable", simpleDefinition: "Something that can actually be done — it's possible", synonyms: ["possible", "practicable", "viable", "achievable"], antonyms: ["impossible", "impractical", "unachievable"], difficulty: 3, pos: "adjective", example: "The plan was feasible within the given time frame." },
  { word: "flamboyant", definition: "Tending to attract attention because of exuberance and confidence", simpleDefinition: "Very showy and over-the-top in a way that gets everyone looking", synonyms: ["extravagant", "showy", "ostentatious", "dazzling"], antonyms: ["modest", "understated", "plain", "restrained"], difficulty: 3, pos: "adjective", example: "The flamboyant performer had the audience in awe." },
  { word: "flourish", definition: "To grow or develop in a healthy or vigorous way; to thrive", simpleDefinition: "To grow well and do really well", synonyms: ["thrive", "prosper", "bloom", "succeed"], antonyms: ["wither", "decline", "fail", "struggle"], difficulty: 2, pos: "verb", example: "The flowers flourished in the warm sunshine." },
  { word: "formidable", definition: "Inspiring fear or respect through being impressively large or capable", simpleDefinition: "So big, strong or impressive that it feels a bit scary", synonyms: ["impressive", "daunting", "intimidating", "powerful"], antonyms: ["weak", "feeble", "ordinary"], difficulty: 3, pos: "adjective", example: "She was a formidable opponent at chess." },
  { word: "forsake", definition: "To abandon or give up something valued or cherished", simpleDefinition: "To leave behind or give up something you care about", synonyms: ["abandon", "desert", "renounce", "relinquish"], antonyms: ["keep", "retain"], difficulty: 3, pos: "verb", example: "She refused to forsake her principles." },
  { word: "fraudulent", definition: "Obtained or done by involving deception", simpleDefinition: "Dishonest and fake — done by cheating or lying", synonyms: ["dishonest", "deceitful", "corrupt", "fake"], antonyms: ["honest", "genuine", "legitimate", "authentic"], difficulty: 3, pos: "adjective", example: "The fraudulent trader was arrested by police." },
  { word: "frugal", definition: "Sparing or economical with money or food; thrifty", simpleDefinition: "Careful not to waste money or food — spending as little as possible", synonyms: ["thrifty", "economical", "careful", "sparing"], antonyms: ["extravagant", "wasteful", "lavish", "generous"], difficulty: 3, pos: "adjective", example: "She was frugal, never wasting a penny." },
  { word: "frivolous", definition: "Not having any serious purpose or value; silly", simpleDefinition: "Silly and not important — a waste of time", synonyms: ["silly", "trivial", "superficial", "flippant"], antonyms: ["serious", "sensible"], difficulty: 3, pos: "adjective", example: "She was told her concerns were frivolous." },
  { word: "futile", definition: "Incapable of producing any result; pointless", simpleDefinition: "Completely pointless — no matter what you do it won't work", synonyms: ["pointless", "useless", "hopeless", "ineffective"], antonyms: ["useful", "effective", "successful", "worthwhile"], difficulty: 3, pos: "adjective", example: "It was futile to argue when the decision had been made." },
  { word: "gallant", definition: "Brave; notably polite and chivalrous", simpleDefinition: "Very brave and polite — like a hero being kind and noble", synonyms: ["brave", "heroic", "chivalrous", "courageous"], antonyms: ["cowardly", "rude", "dishonourable"], difficulty: 3, pos: "adjective", example: "The gallant knight came to her rescue." },
  { word: "grandeur", definition: "Splendour and impressiveness, especially of appearance", simpleDefinition: "Something that looks amazing and very grand or impressive", synonyms: ["magnificence", "splendour", "majesty", "glory"], antonyms: ["simplicity", "humility", "modesty"], difficulty: 3, pos: "noun", example: "They stood in awe of the grandeur of the cathedral." },
  { word: "harmonious", definition: "Forming a pleasing or consistent whole; free from conflict", simpleDefinition: "When things go well together and there's no fighting", synonyms: ["peaceful", "agreeable", "melodious", "compatible"], antonyms: ["discordant", "conflicting", "dissonant"], difficulty: 2, pos: "adjective", example: "The choir produced a harmonious sound." },
  { word: "heedless", definition: "Showing a reckless lack of care or attention", simpleDefinition: "Not paying attention to warnings — just charging ahead anyway", synonyms: ["careless", "inattentive", "reckless", "negligent"], antonyms: ["careful", "attentive", "mindful", "cautious"], difficulty: 3, pos: "adjective", example: "Heedless of the warnings, she ran across the road." },
  { word: "idyllic", definition: "Extremely happy, peaceful, or picturesque", simpleDefinition: "So peaceful and beautiful it feels almost perfect", synonyms: ["perfect", "blissful", "peaceful", "picturesque"], antonyms: ["troubled", "chaotic", "ugly", "unpleasant"], difficulty: 3, pos: "adjective", example: "They spent an idyllic summer in the countryside." },
  { word: "imminent", definition: "About to happen very soon", simpleDefinition: "Going to happen any minute now", synonyms: ["impending", "approaching", "forthcoming", "looming"], antonyms: ["distant", "remote", "unlikely"], difficulty: 3, pos: "adjective", example: "The storm was imminent, so they headed indoors." },
  { word: "impartial", definition: "Treating all rivals or disputants equally; unbiased", simpleDefinition: "Being fair to everyone and not taking sides", synonyms: ["unbiased", "neutral", "fair", "objective"], antonyms: ["biased", "partial", "unfair", "prejudiced"], difficulty: 3, pos: "adjective", example: "The referee must remain impartial." },
  { word: "incessant", definition: "Never ending; continuing without pause", simpleDefinition: "Going on and on without ever stopping", synonyms: ["constant", "continuous", "unending", "relentless"], antonyms: ["occasional", "intermittent", "sporadic"], difficulty: 3, pos: "adjective", example: "The incessant noise kept her awake all night." },
  { word: "indolent", definition: "Wanting to avoid activity or exertion; lazy", simpleDefinition: "Really lazy — not wanting to do anything at all", synonyms: ["lazy", "idle", "lethargic", "slothful"], antonyms: ["energetic", "diligent", "industrious", "active"], difficulty: 3, pos: "adjective", example: "The indolent student barely picked up a book." },
  { word: "insolent", definition: "Showing a rude and disrespectful lack of regard", simpleDefinition: "Rude and disrespectful in a cheeky, confident way", synonyms: ["rude", "impudent", "disrespectful", "insubordinate"], antonyms: ["respectful", "polite"], difficulty: 3, pos: "adjective", example: "The insolent reply earned him a detention." },
  { word: "integral", definition: "Essential or necessary; being part of a whole", simpleDefinition: "A key part that's needed to make something complete", synonyms: ["essential", "fundamental", "necessary", "central"], antonyms: ["unnecessary", "extra", "peripheral"], difficulty: 3, pos: "adjective", example: "Teamwork is integral to the project's success." },
  { word: "intuitive", definition: "Based on what one feels to be true; instinctive", simpleDefinition: "When you just know something without having to think about it", synonyms: ["instinctive", "natural", "spontaneous", "innate"], antonyms: ["calculated", "deliberate", "reasoned"], difficulty: 3, pos: "adjective", example: "She had an intuitive understanding of people." },
  { word: "jovial", definition: "Cheerful and friendly; good-humoured", simpleDefinition: "Happy, friendly and fun to be around", synonyms: ["cheerful", "merry", "jolly", "good-humoured"], antonyms: ["miserable", "gloomy", "sullen"], difficulty: 3, pos: "adjective", example: "The jovial host made all the guests feel welcome." },
  { word: "lament", definition: "To feel or express grief or sorrow; to mourn", simpleDefinition: "To feel sad about something and show it", synonyms: ["mourn", "grieve", "bewail", "deplore"], antonyms: ["celebrate", "rejoice", "cheer"], difficulty: 3, pos: "verb", example: "She lamented the loss of her old school." },
  { word: "lavish", definition: "Sumptuously rich; extravagant; giving generously", simpleDefinition: "Very grand and expensive — way more than is needed", synonyms: ["extravagant", "generous", "luxurious", "opulent"], antonyms: ["frugal", "modest", "economical", "sparse"], difficulty: 3, pos: "adjective", example: "The lavish banquet lasted for hours." },
  { word: "lenient", definition: "Not strict or severe; merciful", simpleDefinition: "Letting people off easily — not too strict or harsh", synonyms: ["mild", "merciful", "easy-going", "tolerant"], antonyms: ["strict", "severe", "harsh", "rigid"], difficulty: 3, pos: "adjective", example: "The lenient judge gave a reduced sentence." },
  { word: "lethargic", definition: "Affected by lethargy; lacking energy; sluggish", simpleDefinition: "Feeling really tired and slow — no energy at all", synonyms: ["sluggish", "tired", "weary", "listless"], antonyms: ["energetic", "lively", "alert", "active"], difficulty: 3, pos: "adjective", example: "He felt lethargic after his long journey." },
  { word: "lofty", definition: "Of imposing height; noble and elevated in character", simpleDefinition: "Very tall, or having big and ambitious ideas", synonyms: ["tall", "elevated", "noble", "high-minded"], antonyms: ["humble", "modest"], difficulty: 2, pos: "adjective", example: "She had lofty ambitions for her future." },
  { word: "lucrative", definition: "Producing a great deal of profit", simpleDefinition: "Making a lot of money", synonyms: ["profitable", "money-making", "rewarding", "gainful"], antonyms: ["unprofitable", "poor", "loss-making"], difficulty: 3, pos: "adjective", example: "Software development is a lucrative career." },
  { word: "luminous", definition: "Bright or shining, especially in the dark; full of light", simpleDefinition: "Glowing brightly — lights up the dark", synonyms: ["bright", "glowing", "radiant", "shining"], antonyms: ["dull", "dark", "dim"], difficulty: 3, pos: "adjective", example: "The luminous stars filled the night sky." },
  { word: "malice", definition: "The desire to harm someone; spite", simpleDefinition: "Wanting to hurt someone on purpose", synonyms: ["spite", "hatred", "ill-will", "venom"], antonyms: ["goodwill", "kindness", "benevolence"], difficulty: 3, pos: "noun", example: "The attack was carried out with malice and intent." },
  { word: "mediocre", definition: "Of only average quality; not very good", simpleDefinition: "Just okay — not bad, but not good either", synonyms: ["average", "ordinary", "passable", "unremarkable"], antonyms: ["excellent", "outstanding", "exceptional"], difficulty: 3, pos: "adjective", example: "His mediocre performance did not impress the panel." },
  { word: "melancholic", definition: "Having a feeling of deep sadness; gloomy", simpleDefinition: "Feeling deeply sad and gloomy for a while", synonyms: ["sad", "gloomy", "dejected", "sorrowful"], antonyms: ["cheerful", "happy", "joyful"], difficulty: 3, pos: "adjective", example: "She felt melancholic as she packed up her childhood bedroom." },
  { word: "meticulous", definition: "Showing great attention to detail; very careful and precise", simpleDefinition: "Being super careful and checking every tiny detail", synonyms: ["careful", "precise", "thorough", "painstaking"], antonyms: ["careless", "sloppy", "negligent", "hasty"], difficulty: 3, pos: "adjective", example: "She was meticulous in checking every word of the essay." },
  { word: "monotonous", definition: "Dull, tedious, and unvarying", simpleDefinition: "So boring because it's always exactly the same", synonyms: ["dull", "repetitive", "tedious", "boring"], antonyms: ["varied", "interesting", "exciting", "stimulating"], difficulty: 2, pos: "adjective", example: "The monotonous lecture sent half the class to sleep." },
  { word: "novice", definition: "A person new to or inexperienced in a field or situation", simpleDefinition: "A total beginner who is just starting to learn something", synonyms: ["beginner", "learner", "newcomer", "amateur"], antonyms: ["expert", "professional", "veteran", "master"], difficulty: 2, pos: "noun", example: "As a novice, she made a few mistakes in her first game." },
  { word: "obstinate", definition: "Stubbornly refusing to change one's opinion or action", simpleDefinition: "Stubborn — won't change their mind no matter what", synonyms: ["stubborn", "headstrong", "pigheaded", "determined"], antonyms: ["flexible", "open-minded", "compliant"], difficulty: 3, pos: "adjective", example: "She was obstinate in refusing all advice." },
  { word: "ordeal", definition: "A very unpleasant and prolonged experience", simpleDefinition: "A really horrible experience that goes on for a long time", synonyms: ["trial", "suffering", "hardship", "trauma"], antonyms: ["pleasure", "delight", "luxury"], difficulty: 2, pos: "noun", example: "Surviving the shipwreck was a terrible ordeal." },
  { word: "pacifist", definition: "A person who believes war and violence are wrong", simpleDefinition: "Someone who believes fighting is always wrong and wants peace", synonyms: ["peacemaker", "dove"], antonyms: ["warmonger", "aggressor"], difficulty: 3, pos: "noun", example: "As a pacifist, he refused to fight in any war." },
  { word: "passive", definition: "Accepting what happens without resisting; not active", simpleDefinition: "Just going along with things without fighting back or getting involved", synonyms: ["inactive", "submissive", "inert", "compliant"], antonyms: ["active", "assertive", "proactive"], difficulty: 2, pos: "adjective", example: "He took a passive role and let others decide." },
  { word: "perilous", definition: "Full of danger; risky", simpleDefinition: "Very dangerous — could easily go badly wrong", synonyms: ["dangerous", "risky", "hazardous", "treacherous"], antonyms: ["safe", "secure", "harmless"], difficulty: 3, pos: "adjective", example: "The perilous mountain path was covered in ice." },
  { word: "perplexed", definition: "Completely baffled; bewildered", simpleDefinition: "Really confused and not sure what's going on", synonyms: ["baffled", "puzzled", "confused", "bewildered"], antonyms: ["certain", "enlightened", "clear-headed"], difficulty: 2, pos: "adjective", example: "She was perplexed by the strange riddle." },
  { word: "pivotal", definition: "Of crucial importance in relation to the development of something", simpleDefinition: "The most important moment — everything changes because of it", synonyms: ["crucial", "critical", "key", "central"], antonyms: ["unimportant", "insignificant", "minor"], difficulty: 3, pos: "adjective", example: "That moment was pivotal in the history of science." },
  { word: "plausible", definition: "Seeming reasonable or probable; convincing", simpleDefinition: "Sounds believable — could easily be true", synonyms: ["believable", "credible", "convincing", "reasonable"], antonyms: ["implausible", "unconvincing"], difficulty: 3, pos: "adjective", example: "Her excuse was plausible, so he believed her." },
  { word: "plummet", definition: "To fall or drop straight down at high speed", simpleDefinition: "To fall really fast — drop like a stone", synonyms: ["plunge", "dive", "drop", "fall"], antonyms: ["rise", "soar", "climb", "ascend"], difficulty: 3, pos: "verb", example: "The temperature plummeted overnight." },
  { word: "precarious", definition: "Not securely held; dangerously uncertain", simpleDefinition: "Wobbly and unsafe — could go wrong at any moment", synonyms: ["unstable", "uncertain", "risky", "dangerous"], antonyms: ["secure", "stable", "safe"], difficulty: 3, pos: "adjective", example: "The ladder was in a precarious position." },
  { word: "prominent", definition: "Important and well-known; jutting out; noticeable", simpleDefinition: "Standing out and getting noticed — well-known or sticking out", synonyms: ["famous", "notable", "well-known", "conspicuous"], antonyms: ["unknown", "obscure", "inconspicuous"], difficulty: 2, pos: "adjective", example: "She was a prominent scientist in her field." },
  { word: "prosper", definition: "To be successful and thrive, especially financially", simpleDefinition: "To do really well and grow stronger", synonyms: ["thrive", "flourish", "succeed", "advance"], antonyms: ["fail", "decline", "struggle", "falter"], difficulty: 2, pos: "verb", example: "The business began to prosper after the new manager arrived." },
  { word: "prudent", definition: "Acting with care and thought for the future; wise", simpleDefinition: "Being sensible and thinking carefully before acting", synonyms: ["wise", "careful", "sensible", "cautious"], antonyms: ["foolish", "reckless", "careless", "imprudent"], difficulty: 3, pos: "adjective", example: "It is prudent to save some money each month." },
  { word: "pungent", definition: "Having a sharply strong taste or smell", simpleDefinition: "A very strong smell or taste that hits you straight away", synonyms: ["sharp", "strong", "acrid", "bitter"], antonyms: ["mild", "bland", "gentle", "subtle"], difficulty: 3, pos: "adjective", example: "The pungent smell of onions filled the kitchen." },
  { word: "quandary", definition: "A state of perplexity or uncertainty; a dilemma", simpleDefinition: "When you're stuck and don't know which choice to make", synonyms: ["dilemma", "uncertainty", "puzzle", "predicament"], antonyms: ["certainty", "solution", "clarity"], difficulty: 3, pos: "noun", example: "She was in a quandary about which offer to accept." },
  { word: "ravenous", definition: "Extremely hungry; very eager for something", simpleDefinition: "So hungry you could eat absolutely anything", synonyms: ["starving", "famished", "voracious", "greedy"], antonyms: ["full", "satisfied", "content"], difficulty: 3, pos: "adjective", example: "After the match, the players were ravenous." },
  { word: "recede", definition: "To move back or gradually become more distant", simpleDefinition: "To slowly move away or get smaller", synonyms: ["retreat", "withdraw", "diminish", "fade"], antonyms: ["advance", "approach", "grow", "increase"], difficulty: 3, pos: "verb", example: "The flood waters began to recede after the storm." },
  { word: "reluctant", definition: "Unwilling and hesitant; not eager", simpleDefinition: "Not really wanting to do something", synonyms: ["unwilling", "hesitant", "disinclined", "loath"], antonyms: ["willing", "eager", "keen", "enthusiastic"], difficulty: 2, pos: "adjective", example: "He was reluctant to admit he was wrong." },
  { word: "remnant", definition: "A small remaining quantity of something; a surviving trace", simpleDefinition: "A small bit of something left over after the rest is gone", synonyms: ["remainder", "remains", "leftover", "trace"], antonyms: ["whole", "entirety", "all"], difficulty: 3, pos: "noun", example: "A remnant of the old wall still stood in the garden." },
  { word: "reprimand", definition: "A formal expression of disapproval; a rebuke", simpleDefinition: "An official telling-off from someone in charge", synonyms: ["rebuke", "censure", "reproof", "scolding"], antonyms: ["praise", "commendation", "reward"], difficulty: 3, pos: "noun", example: "The manager issued a formal reprimand." },
  { word: "resilience", definition: "The ability to recover quickly from difficulty; toughness", simpleDefinition: "Being able to bounce back after something goes wrong", synonyms: ["toughness", "strength", "durability", "adaptability"], antonyms: ["weakness", "fragility", "vulnerability"], difficulty: 3, pos: "noun", example: "Her resilience in the face of hardship was remarkable." },
  { word: "respite", definition: "A short period of rest or relief from something difficult", simpleDefinition: "A short break from something hard or stressful", synonyms: ["break", "rest", "pause", "relief"], antonyms: ["continuation", "persistence", "relentlessness"], difficulty: 3, pos: "noun", example: "The holiday offered a welcome respite from work." },
  { word: "retort", definition: "A sharp, clever, or witty reply", simpleDefinition: "A quick, clever comeback in an argument", synonyms: ["reply", "riposte", "comeback", "rejoinder"], difficulty: 3, pos: "noun", example: "She delivered a sharp retort that silenced her critics." },
  { word: "ruffian", definition: "A violent, lawless person; a bully", simpleDefinition: "A rough, tough person who acts like a bully", synonyms: ["thug", "bully", "hooligan", "brute"], antonyms: ["gentleman", "saint"], difficulty: 3, pos: "noun", example: "The shopkeeper was threatened by a group of ruffians." },
  { word: "sage", definition: "Wise, especially as the result of experience; a wise person", simpleDefinition: "Very wise — someone who knows a lot from years of experience", synonyms: ["wise", "sensible", "prudent", "judicious"], antonyms: ["foolish", "naive", "unwise"], difficulty: 3, pos: "adjective", example: "The old sage offered wise counsel." },
  { word: "scarcity", definition: "Insufficiency of supply; the state of being scarce", simpleDefinition: "When there isn't enough of something and it's hard to find", synonyms: ["shortage", "lack", "dearth", "insufficiency"], antonyms: ["abundance", "plenty", "surplus"], difficulty: 3, pos: "noun", example: "The drought caused a scarcity of clean water." },
  { word: "sceptical", definition: "Not easily convinced; having doubts or reservations", simpleDefinition: "Not believing something straight away — wanting proof first", synonyms: ["doubtful", "dubious", "unconvinced", "questioning"], antonyms: ["certain", "convinced", "trusting", "credulous"], difficulty: 3, pos: "adjective", example: "She was sceptical about his promises." },
  { word: "serene", definition: "Calm, peaceful, and untroubled", simpleDefinition: "Perfectly calm and peaceful — nothing is worrying you", synonyms: ["peaceful", "calm", "tranquil", "composed"], antonyms: ["agitated", "troubled", "turbulent", "anxious"], difficulty: 2, pos: "adjective", example: "The lake was serene in the early morning light." },
  { word: "shrewd", definition: "Having sharp powers of judgement; clever in practical matters", simpleDefinition: "Really clever at figuring out the best way to handle things", synonyms: ["clever", "astute", "perceptive", "sharp"], antonyms: ["naive", "simple", "foolish", "gullible"], difficulty: 3, pos: "adjective", example: "She was a shrewd businesswoman who never made bad deals." },
  { word: "strenuous", definition: "Requiring or using great effort or exertion", simpleDefinition: "Very hard and tiring — needs a lot of effort", synonyms: ["demanding", "exhausting", "vigorous", "taxing"], antonyms: ["easy", "effortless", "relaxed"], difficulty: 3, pos: "adjective", example: "The strenuous hike left them all exhausted." },
  { word: "tardy", definition: "Delayed beyond the expected time; slow to act", simpleDefinition: "Late — not arriving or doing things when you should", synonyms: ["late", "delayed", "slow", "overdue"], antonyms: ["punctual", "prompt", "early", "timely"], difficulty: 3, pos: "adjective", example: "She was tardy to class and missed the instructions." },
  { word: "tempestuous", definition: "Very stormy; full of intense emotion and conflict", simpleDefinition: "Wild and stormy — full of strong feelings and arguments", synonyms: ["stormy", "turbulent", "passionate", "volatile"], antonyms: ["calm", "peaceful", "serene", "stable"], difficulty: 3, pos: "adjective", example: "Their relationship was as tempestuous as the sea." },
  { word: "terminate", definition: "To bring to an end or conclude", simpleDefinition: "To stop or end something", synonyms: ["end", "conclude", "finish", "cease"], antonyms: ["begin", "start", "initiate", "continue"], difficulty: 2, pos: "verb", example: "They decided to terminate the contract early." },
  { word: "transient", definition: "Lasting only for a short time; passing", simpleDefinition: "Only around for a short time — then it's gone", synonyms: ["temporary", "brief", "fleeting", "short-lived"], antonyms: ["permanent", "lasting"], difficulty: 3, pos: "adjective", example: "Fame can be transient — here today, gone tomorrow." },
  { word: "trivial", definition: "Of little value or importance; minor", simpleDefinition: "Not important — too small to bother about", synonyms: ["unimportant", "minor", "insignificant", "petty"], antonyms: ["important", "significant", "major", "crucial"], difficulty: 2, pos: "adjective", example: "Don't worry about trivial details." },
  { word: "turbulent", definition: "Moving in a chaotic and unstable way; full of disorder", simpleDefinition: "Rough and out of control — like a stormy sea", synonyms: ["stormy", "chaotic", "unstable", "wild"], antonyms: ["calm", "peaceful", "stable", "ordered"], difficulty: 3, pos: "adjective", example: "The turbulent seas made the crossing dangerous." },
  { word: "unanimous", definition: "Fully agreed by everyone involved", simpleDefinition: "When absolutely everyone agrees — not one person disagrees", synonyms: ["united", "agreed", "undivided", "solid"], antonyms: ["divided", "split", "disputed", "opposed"], difficulty: 3, pos: "adjective", example: "The vote was unanimous — everyone agreed." },
  { word: "vague", definition: "Not clearly expressed or defined; uncertain", simpleDefinition: "Unclear and hard to understand — not giving enough detail", synonyms: ["unclear", "imprecise", "indefinite", "ambiguous"], antonyms: ["clear", "definite", "precise", "specific"], difficulty: 1, pos: "adjective", example: "Her instructions were too vague to be useful." },
  { word: "vain", definition: "Having an excessively high opinion of oneself; without result", simpleDefinition: "Too proud of how you look, or trying hard but getting nowhere", synonyms: ["conceited", "arrogant", "proud"], antonyms: ["modest", "humble"], difficulty: 2, pos: "adjective", example: "All his efforts were in vain." },
  { word: "vigilant", definition: "Keeping careful watch for possible danger or difficulties", simpleDefinition: "Keeping a close eye out for anything that might go wrong", synonyms: ["watchful", "alert", "attentive", "observant"], antonyms: ["inattentive", "careless", "negligent"], difficulty: 3, pos: "adjective", example: "Security staff must remain vigilant at all times." },
  { word: "virtue", definition: "Behaviour showing high moral standards; a good quality", simpleDefinition: "A good quality — like being kind, honest or brave", synonyms: ["goodness", "morality", "integrity", "merit"], antonyms: ["vice", "immorality", "wickedness"], difficulty: 2, pos: "noun", example: "Patience is a virtue." },
  { word: "virtuous", definition: "Having or showing high moral standards", simpleDefinition: "A good person who does the right thing", synonyms: ["moral", "righteous", "good", "honourable"], antonyms: ["immoral", "corrupt", "wicked", "sinful"], difficulty: 3, pos: "adjective", example: "She was regarded as a virtuous leader." },
  { word: "vivid", definition: "Producing powerful feelings or clear images; bright and strong", simpleDefinition: "Really bright and clear — you can picture it perfectly", synonyms: ["bright", "striking", "colourful", "lifelike"], antonyms: ["dull", "faint", "vague", "pale"], difficulty: 2, pos: "adjective", example: "She had a vivid memory of that summer." },
  { word: "volatile", definition: "Liable to change rapidly and unpredictably; explosive", simpleDefinition: "Likely to suddenly change or blow up without warning", synonyms: ["unstable", "unpredictable", "explosive", "changeable"], antonyms: ["stable", "calm", "predictable", "steady"], difficulty: 3, pos: "adjective", example: "The volatile situation could erupt at any moment." },
  { word: "wary", definition: "Feeling or showing caution about possible dangers", simpleDefinition: "Being careful and watching out — not fully trusting something", synonyms: ["cautious", "careful", "alert", "vigilant"], antonyms: ["careless", "reckless", "trusting", "naive"], difficulty: 2, pos: "adjective", example: "She was wary of trusting strangers." },
  { word: "wither", definition: "To become dry and shrivelled; to lose freshness or vitality", simpleDefinition: "To dry up and die — like a plant without water", synonyms: ["shrivel", "wilt", "fade", "decay"], antonyms: ["flourish", "bloom", "thrive", "grow"], difficulty: 2, pos: "verb", example: "The flowers withered in the summer heat." },
  { word: "yearn", definition: "To have an intense feeling of longing for something", simpleDefinition: "To really, really want or miss something", synonyms: ["crave", "desire", "long", "pine"], antonyms: ["dislike", "despise"], difficulty: 2, pos: "verb", example: "She yearned to return home after years abroad." },
  { word: "audacious", definition: "Showing a willingness to take surprisingly bold risks", simpleDefinition: "Very daring — doing something bold that surprises everyone", synonyms: ["bold", "daring", "brazen", "fearless"], antonyms: ["cowardly", "timid", "cautious"], difficulty: 3, pos: "adjective", example: "It was an audacious plan that few believed would work." },
  { word: "benevolence", definition: "The quality of being well-meaning and kind", simpleDefinition: "Being kind and wanting to help others", synonyms: ["kindness", "generosity", "charity", "goodwill"], antonyms: ["cruelty", "malevolence", "meanness"], difficulty: 3, pos: "noun", example: "The king was known for his benevolence to the poor." },
  { word: "blissful", definition: "Full of joy and happiness", simpleDefinition: "Completely and totally happy", synonyms: ["joyful", "ecstatic", "happy", "elated"], antonyms: ["miserable", "wretched", "sorrowful"], difficulty: 2, pos: "adjective", example: "They spent a blissful week by the sea." },
  { word: "charismatic", definition: "Having a powerful personal charm or appeal", simpleDefinition: "So charming and likeable that people are drawn to you", synonyms: ["charming", "magnetic", "compelling", "attractive"], antonyms: ["boring", "repulsive", "dull"], difficulty: 3, pos: "adjective", example: "The charismatic leader inspired devotion in his followers." },
  { word: "contemporary", definition: "Living or occurring at the same time; modern", simpleDefinition: "From the same time period — modern or happening right now", synonyms: ["modern", "current", "present-day", "simultaneous"], antonyms: ["ancient", "historical", "old-fashioned"], difficulty: 3, pos: "adjective", example: "She was a contemporary of Shakespeare." },
  { word: "endure", definition: "To suffer patiently; to remain in existence", simpleDefinition: "To put up with something hard and keep going", synonyms: ["suffer", "tolerate", "withstand", "persist"], antonyms: ["surrender", "collapse", "yield"], difficulty: 2, pos: "verb", example: "She endured the pain without complaint." },
  { word: "exuberant", definition: "Filled with energy and enthusiasm; showing unrestrained joy", simpleDefinition: "Bursting with energy and excitement — can't hold it in", synonyms: ["enthusiastic", "energetic", "lively", "vibrant"], antonyms: ["subdued", "gloomy", "restrained", "apathetic"], difficulty: 3, pos: "adjective", example: "The exuberant crowd cheered wildly." },
  { word: "frantic", definition: "Wild or distraught with fear, anxiety, or other emotion", simpleDefinition: "In a panic — rushing around in a state of worry or fear", synonyms: ["frenzied", "wild", "distraught", "desperate"], antonyms: ["calm", "composed", "controlled"], difficulty: 2, pos: "adjective", example: "There was a frantic search for the missing child." },
  { word: "impending", definition: "About to happen; imminent", simpleDefinition: "Something that's coming very soon — you can feel it approaching", synonyms: ["imminent", "forthcoming", "approaching", "looming"], antonyms: ["remote", "distant", "past"], difficulty: 3, pos: "adjective", example: "Everyone felt the tension of the impending storm." },
  { word: "indignant", definition: "Feeling or showing anger at unfair treatment", simpleDefinition: "Angry because something unfair has happened to you", synonyms: ["angry", "offended", "aggrieved", "outraged"], antonyms: ["pleased", "content", "indifferent"], difficulty: 3, pos: "adjective", example: "She was indignant at being accused of lying." },
  { word: "infamous", definition: "Well-known for some bad quality or deed", simpleDefinition: "Famous but for doing something bad or wrong", synonyms: ["notorious", "disreputable", "dishonourable", "scandalous"], antonyms: ["famous", "respected", "honoured", "reputable"], difficulty: 3, pos: "adjective", example: "The infamous criminal was finally caught." },
  { word: "meagre", definition: "Lacking in quantity or quality; very small", simpleDefinition: "A tiny, not-enough amount — barely anything", synonyms: ["scarce", "sparse", "insufficient", "poor"], antonyms: ["ample", "plentiful", "generous", "abundant"], difficulty: 3, pos: "adjective", example: "The survivors lived on meagre rations." },
  { word: "menacing", definition: "Suggesting the presence of danger; threatening", simpleDefinition: "Scary and threatening — feels like danger is close", synonyms: ["threatening", "ominous", "sinister", "intimidating"], antonyms: ["reassuring", "friendly", "harmless"], difficulty: 3, pos: "adjective", example: "The dark clouds had a menacing look about them." },
  { word: "noteworthy", definition: "Interesting, significant, or unusual enough to be noticed", simpleDefinition: "Worth paying attention to — stands out as special", synonyms: ["notable", "significant", "remarkable", "exceptional"], antonyms: ["unremarkable", "ordinary", "insignificant"], difficulty: 3, pos: "adjective", example: "His noteworthy performance earned a standing ovation." },
  { word: "pensive", definition: "Engaged in deep or serious thought; thoughtful", simpleDefinition: "Quietly thinking deeply about something — a bit lost in thought", synonyms: ["thoughtful", "reflective", "contemplative", "wistful"], antonyms: ["unthinking", "cheerful", "carefree"], difficulty: 3, pos: "adjective", example: "She sat in pensive silence, staring at the sea." },
  { word: "persevere", definition: "To continue in a course of action despite difficulty", simpleDefinition: "To keep going even when things get really hard", synonyms: ["persist", "continue", "endure", "persist"], antonyms: ["quit", "abandon", "falter"], difficulty: 2, pos: "verb", example: "Despite setbacks, she persevered and finally succeeded." },
  { word: "pompous", definition: "Affectedly grand and self-important", simpleDefinition: "Acting like you're much more important than you really are", synonyms: ["arrogant", "self-important", "conceited", "haughty"], antonyms: ["modest", "humble", "down-to-earth"], difficulty: 3, pos: "adjective", example: "The pompous official refused to listen to anyone." },
  { word: "reproach", definition: "The expression of disapproval or disappointment; blame", simpleDefinition: "Looking at someone or saying something to show you're disappointed in them", synonyms: ["blame", "criticism", "censure", "rebuke"], antonyms: ["praise", "approval", "commendation"], difficulty: 3, pos: "noun", example: "She looked at him with reproach in her eyes." },
  { word: "revere", definition: "To feel deep respect or admiration for something", simpleDefinition: "To deeply look up to and respect someone", synonyms: ["respect", "admire", "honour", "venerate"], antonyms: ["disrespect", "despise", "mock"], difficulty: 3, pos: "verb", example: "The students revered their wise and patient teacher." },
  { word: "tenacious", definition: "Tending to keep a firm hold; persistent", simpleDefinition: "Never giving up — holding on tight no matter what", synonyms: ["persistent", "determined", "resolute", "stubborn"], antonyms: ["yielding", "weak", "irresolute"], difficulty: 3, pos: "adjective", example: "She was tenacious in her pursuit of justice." },
  { word: "wretched", definition: "In a very unhappy or unfortunate state; of poor quality", simpleDefinition: "Feeling really miserable and unlucky, or very bad quality", synonyms: ["miserable", "unhappy", "unfortunate", "pitiful"], antonyms: ["happy", "fortunate", "excellent"], difficulty: 2, pos: "adjective", example: "The wretched conditions in the camp shocked the visitors." },
  { word: "abundant", definition: "Present in great quantities; more than sufficient", simpleDefinition: "Having loads of something — way more than you need", synonyms: ["plentiful", "ample", "copious", "profuse"], antonyms: ["scarce", "meagre", "insufficient"], difficulty: 2, pos: "adjective", example: "The forest was abundant in wildlife." },
  { word: "adversary", definition: "An opponent or enemy", simpleDefinition: "Someone who is against you — your enemy or opponent", synonyms: ["opponent", "enemy", "rival", "foe"], antonyms: ["ally", "friend", "supporter"], difficulty: 3, pos: "noun", example: "He faced his adversary in the final round." },
  { word: "adversity", definition: "A difficult or unpleasant situation; hardship", simpleDefinition: "Hard times — when life is really tough and difficult", synonyms: ["hardship", "misfortune", "difficulty", "suffering"], antonyms: ["prosperity", "ease"], difficulty: 3, pos: "noun", example: "She showed great courage in the face of adversity." },
  { word: "afflict", definition: "To cause pain, suffering, or distress to someone", simpleDefinition: "To make someone suffer from something painful", synonyms: ["torment", "trouble", "distress", "plague"], antonyms: ["comfort", "relieve", "help"], difficulty: 3, pos: "verb", example: "The illness afflicted thousands of people." },
  { word: "agile", definition: "Able to move quickly and easily; nimble", simpleDefinition: "Quick and nimble — good at moving your body fast", synonyms: ["nimble", "lithe", "supple", "quick"], antonyms: ["clumsy", "stiff", "slow", "awkward"], difficulty: 2, pos: "adjective", example: "The agile gymnast leaped across the mat." },
  { word: "allegiance", definition: "Loyalty or commitment to a group, cause, or person", simpleDefinition: "Being loyal and faithful to someone or something", synonyms: ["loyalty", "devotion", "faithfulness", "commitment"], antonyms: ["disloyalty", "betrayal", "treachery"], difficulty: 3, pos: "noun", example: "The soldiers swore allegiance to their country." },
  { word: "ambitious", definition: "Having a strong desire to succeed or achieve something", simpleDefinition: "Really wanting to succeed and working hard to get there", synonyms: ["determined", "driven", "motivated", "aspiring"], antonyms: ["unambitious", "lazy", "content", "apathetic"], difficulty: 2, pos: "adjective", example: "She was ambitious and hoped to become a doctor." },
  { word: "ambiguous", definition: "Open to more than one interpretation; unclear", simpleDefinition: "Could mean more than one thing — not quite clear", synonyms: ["unclear", "vague", "uncertain", "obscure"], antonyms: ["clear", "unambiguous", "definite", "certain"], difficulty: 3, pos: "adjective", example: "The instructions were ambiguous and confusing." },
  { word: "appease", definition: "To make someone calmer by giving what they want", simpleDefinition: "To calm someone down by giving them what they want", synonyms: ["placate", "satisfy", "pacify", "mollify"], antonyms: ["provoke", "agitate", "anger", "upset"], difficulty: 3, pos: "verb", example: "She tried to appease the angry customer." },
  { word: "ardent", definition: "Very enthusiastic or passionate; burning", simpleDefinition: "Feeling very strongly about something — full of passion", synonyms: ["passionate", "fervent", "eager", "devoted"], antonyms: ["indifferent", "apathetic"], difficulty: 3, pos: "adjective", example: "He was an ardent supporter of the team." },
  { word: "assert", definition: "To state a fact confidently and forcefully", simpleDefinition: "To say something firmly and with confidence", synonyms: ["declare", "state", "insist", "maintain"], antonyms: ["deny", "retract", "question"], difficulty: 3, pos: "verb", example: "She asserted her right to speak." },
  { word: "astonish", definition: "To surprise someone greatly; to amaze", simpleDefinition: "To shock or surprise someone in a good way", synonyms: ["amaze", "astound", "stun", "surprise"], antonyms: ["bore", "unimpress"], difficulty: 2, pos: "verb", example: "Her talent for maths astonished her teachers." },
  { word: "austere", definition: "Severe and strict; having no decoration or luxury", simpleDefinition: "Very plain and strict — nothing extra or fancy", synonyms: ["stern", "strict", "plain", "harsh"], antonyms: ["lavish", "luxurious"], difficulty: 3, pos: "adjective", example: "The austere headteacher rarely smiled." },
  { word: "awe", definition: "A feeling of great wonder and respect", simpleDefinition: "A feeling of being amazed and overwhelmed by something impressive", synonyms: ["wonder", "admiration", "reverence", "amazement"], antonyms: ["contempt", "indifference", "boredom"], difficulty: 2, pos: "noun", example: "They gazed in awe at the towering mountains." },
  { word: "banish", definition: "To send someone away as a punishment; to drive away", simpleDefinition: "To send someone away and not let them come back", synonyms: ["exile", "expel", "dismiss", "oust"], antonyms: ["welcome", "invite", "accept"], difficulty: 3, pos: "verb", example: "The king banished the traitor from his kingdom." },
  { word: "betray", definition: "To be disloyal to someone who trusts you", simpleDefinition: "To let down someone who trusted you — going behind their back", synonyms: ["deceive", "double-cross", "abandon", "desert"], antonyms: ["support", "defend", "protect"], difficulty: 2, pos: "verb", example: "He betrayed his best friend by sharing her secret." },
  { word: "bleak", definition: "Cold and unwelcoming; offering little hope", simpleDefinition: "Gloomy and hopeless — nothing cheerful about it", synonyms: ["gloomy", "dreary", "hopeless", "desolate"], antonyms: ["cheerful", "bright", "hopeful", "promising"], difficulty: 2, pos: "adjective", example: "The bleak winter landscape stretched for miles." },
  { word: "bountiful", definition: "Large in quantity; giving generously", simpleDefinition: "Loads of it — more than enough, given freely", synonyms: ["plentiful", "generous", "abundant", "ample"], antonyms: ["scarce", "meagre"], difficulty: 3, pos: "adjective", example: "The harvest was bountiful after the summer rains." },
  { word: "callous", definition: "Showing no concern for others; cruel and unfeeling", simpleDefinition: "Not caring at all about other people's feelings", synonyms: ["unfeeling", "cruel", "heartless", "merciless"], antonyms: ["caring", "compassionate", "sensitive", "kind"], difficulty: 3, pos: "adjective", example: "His callous remark upset everyone in the room." },
  { word: "captivate", definition: "To attract and hold the interest of someone", simpleDefinition: "To grab someone's attention and hold it completely", synonyms: ["enchant", "fascinate", "charm", "mesmerise"], antonyms: ["bore", "repel", "repulse"], difficulty: 3, pos: "verb", example: "The storyteller captivated the children with her tale." },
  { word: "catastrophe", definition: "A sudden disaster causing great harm or suffering", simpleDefinition: "A huge disaster — something terrible that happens suddenly", synonyms: ["disaster", "calamity", "tragedy", "devastation"], antonyms: ["blessing", "triumph", "success"], difficulty: 3, pos: "noun", example: "The earthquake was a catastrophe for the region." },
  { word: "coerce", definition: "To force someone to do something through threats", simpleDefinition: "To make someone do something by threatening them", synonyms: ["force", "compel", "pressure", "intimidate"], antonyms: ["persuade", "encourage", "allow"], difficulty: 3, pos: "verb", example: "He was coerced into signing the document." },
  { word: "compassion", definition: "A feeling of sympathy and care for those who suffer", simpleDefinition: "Feeling sorry for someone and wanting to help them", synonyms: ["sympathy", "kindness", "empathy", "pity"], antonyms: ["cruelty", "indifference", "callousness"], difficulty: 2, pos: "noun", example: "She showed great compassion for the homeless." },
  { word: "contempt", definition: "A feeling that something is worthless or beneath you", simpleDefinition: "Feeling that someone or something is completely worthless", synonyms: ["scorn", "disdain", "disrespect", "derision"], antonyms: ["respect", "admiration", "esteem"], difficulty: 3, pos: "noun", example: "She looked at the liar with contempt." },
  { word: "corrupt", definition: "Willing to act dishonestly for personal gain; dishonest", simpleDefinition: "Dishonest and willing to cheat to get what you want", synonyms: ["dishonest", "crooked", "fraudulent", "immoral"], antonyms: ["honest", "upright", "virtuous", "moral"], difficulty: 2, pos: "adjective", example: "The corrupt official took bribes." },
  { word: "courageous", definition: "Not deterred by danger or pain; brave", simpleDefinition: "Facing danger without being scared — truly brave", synonyms: ["brave", "heroic", "valiant", "daring"], antonyms: ["cowardly", "fearful", "timid"], difficulty: 2, pos: "adjective", example: "The courageous firefighter rescued the child." },
  { word: "cowardice", definition: "Lack of bravery; failure to act in the face of danger", simpleDefinition: "Being too scared to do what needs to be done", synonyms: ["timidity", "fearfulness", "weakness", "spinelessness"], antonyms: ["bravery", "courage", "valour"], difficulty: 3, pos: "noun", example: "Running away was seen as an act of cowardice." },
  { word: "crafty", definition: "Clever at achieving things in a sneaky way; cunning", simpleDefinition: "Clever and sneaky — good at tricking people", synonyms: ["cunning", "sly", "devious", "scheming"], antonyms: ["honest", "straightforward", "naive"], difficulty: 2, pos: "adjective", example: "The crafty fox outsmarted the farmer." },
  { word: "cunning", definition: "Having skill in achieving goals in a deceptive way", simpleDefinition: "Clever and good at tricks — getting what you want by being sly", synonyms: ["sly", "crafty", "devious", "wily"], antonyms: ["honest", "naive", "straightforward"], difficulty: 2, pos: "adjective", example: "The cunning villain fooled everyone." },
  { word: "dauntless", definition: "Showing fearlessness and determination", simpleDefinition: "Completely fearless — nothing can put you off", synonyms: ["fearless", "bold", "undaunted", "resolute"], antonyms: ["cowardly", "timid", "afraid"], difficulty: 3, pos: "adjective", example: "The dauntless explorer continued despite the danger." },
  { word: "deceive", definition: "To cause someone to believe something that is not true", simpleDefinition: "To trick someone into thinking something false is true", synonyms: ["mislead", "trick", "fool", "delude"], antonyms: ["enlighten", "expose"], difficulty: 2, pos: "verb", example: "He tried to deceive his parents about where he had been." },
  { word: "defiant", definition: "Showing bold resistance to an opposing force", simpleDefinition: "Standing up and refusing to obey — not backing down", synonyms: ["disobedient", "rebellious", "resistant", "insubordinate"], antonyms: ["obedient", "compliant", "submissive"], difficulty: 3, pos: "adjective", example: "She gave a defiant response to the unfair rule." },
  { word: "desolate", definition: "Uninhabited and empty; feeling very lonely and unhappy", simpleDefinition: "Empty and lonely — completely deserted", synonyms: ["barren", "bleak", "empty", "forsaken"], antonyms: ["inhabited", "lively", "populated"], difficulty: 3, pos: "adjective", example: "The desolate landscape made them feel very alone." },
  { word: "despair", definition: "Complete loss of hope; great unhappiness", simpleDefinition: "Feeling like there is no hope left at all", synonyms: ["hopelessness", "misery", "anguish", "gloom"], antonyms: ["hope", "optimism", "joy"], difficulty: 2, pos: "noun", example: "She fell into despair when all her plans failed." },
  { word: "devious", definition: "Showing a dishonest ability to get what you want", simpleDefinition: "Sneaky and tricky — not being straightforward or honest", synonyms: ["sly", "cunning", "deceitful", "underhanded"], antonyms: ["honest", "straightforward", "sincere"], difficulty: 3, pos: "adjective", example: "The devious plan involved lots of tricks." },
  { word: "dignified", definition: "Having or showing a composed and serious manner", simpleDefinition: "Calm and respected — behaving with self-respect", synonyms: ["stately", "noble", "honourable", "composed"], antonyms: ["undignified", "shameful", "disgraceful"], difficulty: 3, pos: "adjective", example: "She gave a dignified response to the insults." },
  { word: "discord", definition: "Disagreement and conflict between people", simpleDefinition: "Arguments and bad feeling between people — not getting along", synonyms: ["conflict", "disagreement", "strife", "tension"], antonyms: ["harmony", "agreement", "peace"], difficulty: 3, pos: "noun", example: "Discord between the two sides led to arguments." },
  { word: "disdain", definition: "A feeling that something is unworthy of consideration", simpleDefinition: "Looking down on something as if it's too low for you", synonyms: ["contempt", "scorn", "disrespect", "derision"], antonyms: ["respect", "admiration", "esteem"], difficulty: 3, pos: "noun", example: "She looked at the suggestion with disdain." },
  { word: "distress", definition: "Extreme anxiety, pain, or suffering", simpleDefinition: "Feeling very upset, worried or in a lot of pain", synonyms: ["suffering", "anguish", "misery", "torment"], antonyms: ["comfort", "relief", "happiness"], difficulty: 2, pos: "noun", example: "The child was in great distress after getting lost." },
  { word: "dominant", definition: "Most important, powerful, or influential", simpleDefinition: "In charge and more powerful than everyone else", synonyms: ["leading", "powerful", "commanding", "supreme"], antonyms: ["weak", "inferior", "submissive"], difficulty: 2, pos: "adjective", example: "The lion is the dominant predator on the savannah." },
  { word: "dread", definition: "Great fear or apprehension", simpleDefinition: "A really strong, heavy feeling of fear about something", synonyms: ["fear", "terror", "apprehension", "horror"], antonyms: ["courage", "confidence", "calm"], difficulty: 2, pos: "noun", example: "She was filled with dread before the performance." },
  { word: "dubious", definition: "Hesitating or doubting; not reliable", simpleDefinition: "Not sure about something — feeling like it might not be right", synonyms: ["doubtful", "uncertain", "suspicious", "questionable"], antonyms: ["certain", "trustworthy", "reliable"], difficulty: 3, pos: "adjective", example: "He looked dubious when she explained her excuse." },
  { word: "earnest", definition: "Sincere and serious in manner or intention", simpleDefinition: "Really meaning it — being totally serious and honest", synonyms: ["sincere", "serious", "genuine", "solemn"], antonyms: ["insincere", "flippant", "frivolous"], difficulty: 3, pos: "adjective", example: "She made an earnest promise to do better." },
  { word: "eccentric", definition: "Unconventional and slightly strange in behaviour", simpleDefinition: "A bit odd and unusual — doing things differently to most people", synonyms: ["odd", "peculiar", "quirky", "unconventional"], antonyms: ["conventional", "ordinary", "normal"], difficulty: 3, pos: "adjective", example: "The eccentric inventor wore mismatched clothes." },
  { word: "ecstatic", definition: "Feeling overwhelming happiness or joy", simpleDefinition: "Over the moon — feeling an amazing rush of happiness", synonyms: ["overjoyed", "elated", "thrilled", "rapturous"], antonyms: ["miserable", "devastated", "gloomy"], difficulty: 3, pos: "adjective", example: "She was ecstatic when she won first prize." },
  { word: "eerie", definition: "Strange and frightening; mysterious", simpleDefinition: "Creepy and mysterious — gives you a strange uneasy feeling", synonyms: ["spooky", "uncanny", "strange", "mysterious"], antonyms: ["ordinary", "familiar", "comforting"], difficulty: 2, pos: "adjective", example: "An eerie silence fell over the house." },
  { word: "eloquent", definition: "Able to speak or write clearly and persuasively", simpleDefinition: "Very good at expressing ideas in a clear and impressive way", synonyms: ["articulate", "fluent", "expressive", "persuasive"], antonyms: ["inarticulate", "unclear"], difficulty: 3, pos: "adjective", example: "The eloquent speaker moved the audience to tears." },
  { word: "endeavour", definition: "A serious attempt to do or achieve something", simpleDefinition: "Trying hard to do something important", synonyms: ["attempt", "effort", "try", "undertaking"], antonyms: ["inaction", "idleness", "neglect"], difficulty: 3, pos: "noun", example: "Despite every endeavour, he could not solve the puzzle." },
  { word: "endurance", definition: "The ability to withstand hardship for a long time", simpleDefinition: "Being able to keep going even when things are really tough", synonyms: ["stamina", "persistence", "fortitude", "resilience"], antonyms: ["weakness", "fragility", "surrender"], difficulty: 3, pos: "noun", example: "The marathon tests the endurance of every runner." },
  { word: "enigma", definition: "A person or thing that is mysterious and hard to understand", simpleDefinition: "A mystery — something puzzling that's hard to figure out", synonyms: ["mystery", "puzzle", "riddle", "conundrum"], antonyms: ["certainty", "clarity", "simplicity"], difficulty: 3, pos: "noun", example: "The old painting remained an enigma to all who saw it." },
  { word: "envy", definition: "A feeling of wanting something that someone else has", simpleDefinition: "Wishing you had what someone else has", synonyms: ["jealousy", "covetousness", "resentment", "bitterness"], antonyms: ["contentment", "satisfaction"], difficulty: 2, pos: "noun", example: "She looked at the new bicycle with envy." },
  { word: "esteem", definition: "Respect and admiration; to have a high opinion of", simpleDefinition: "Thinking very highly of someone — real respect and admiration", synonyms: ["respect", "admiration", "regard", "reverence"], antonyms: ["contempt", "disrespect", "scorn"], difficulty: 3, pos: "noun", example: "He was held in high esteem by all who knew him." },
  { word: "exile", definition: "The state of being sent away from one's home; to banish", simpleDefinition: "Being forced to leave your home and not allowed back", synonyms: ["banishment", "expulsion", "deportation", "removal"], antonyms: ["welcome", "return", "homecoming"], difficulty: 3, pos: "noun", example: "The politician was sent into exile after the uprising." },
  { word: "famine", definition: "An extreme and widespread shortage of food", simpleDefinition: "When there isn't enough food and many people go hungry", synonyms: ["starvation", "hunger", "shortage", "scarcity"], antonyms: ["abundance", "plenty", "feast"], difficulty: 3, pos: "noun", example: "The famine affected millions across the region." },
  { word: "feeble", definition: "Lacking physical strength; weak and helpless", simpleDefinition: "Very weak — without any strength", synonyms: ["weak", "frail", "puny", "helpless"], antonyms: ["strong", "powerful", "robust", "sturdy"], difficulty: 2, pos: "adjective", example: "The feeble old man could barely lift the bag." },
  { word: "feign", definition: "To pretend to be affected by something; to fake", simpleDefinition: "To act like something is true when it isn't — to pretend", synonyms: ["pretend", "fake", "simulate", "affect"], difficulty: 3, pos: "verb", example: "She feigned illness to avoid going to school." },
  { word: "fervent", definition: "Having or showing great warmth and intensity of feeling", simpleDefinition: "Showing very strong, deep feelings about something", synonyms: ["passionate", "intense", "ardent", "enthusiastic"], antonyms: ["indifferent", "apathetic"], difficulty: 3, pos: "adjective", example: "He was a fervent believer in fair treatment." },
  { word: "fierce", definition: "Violent and aggressive; showing strong feelings", simpleDefinition: "Very powerful and a bit scary — intense and aggressive", synonyms: ["ferocious", "violent", "intense", "savage"], antonyms: ["gentle", "mild", "calm", "tame"], difficulty: 2, pos: "adjective", example: "The fierce wind blew trees down across the road." },
  { word: "foe", definition: "An enemy or opponent", simpleDefinition: "An enemy — someone who is against you", synonyms: ["enemy", "adversary", "opponent", "rival"], antonyms: ["friend", "ally", "supporter"], difficulty: 2, pos: "noun", example: "The two foes faced each other across the field." },
  { word: "folly", definition: "An act that is foolish or lacking in wisdom", simpleDefinition: "Doing something really silly or unwise", synonyms: ["foolishness", "stupidity", "recklessness", "nonsense"], antonyms: ["wisdom", "sense", "prudence"], difficulty: 3, pos: "noun", example: "It was sheer folly to set off without a map." },
  { word: "forlorn", definition: "Sad and lonely; appearing abandoned or hopeless", simpleDefinition: "Sad and lonely — like nobody cares about you", synonyms: ["lonely", "abandoned", "desolate", "wretched"], antonyms: ["cheerful", "content", "loved"], difficulty: 3, pos: "adjective", example: "The forlorn puppy sat waiting at the gate." },
  { word: "frail", definition: "Weak and delicate; easily damaged or broken", simpleDefinition: "Very delicate and easily hurt — not strong at all", synonyms: ["weak", "delicate", "fragile", "feeble"], antonyms: ["strong", "sturdy", "robust", "tough"], difficulty: 2, pos: "adjective", example: "The frail old woman leaned on her stick." },
  { word: "frenzied", definition: "Wildly excited or uncontrolled", simpleDefinition: "In a wild, out-of-control rush of excitement or panic", synonyms: ["frantic", "hysterical", "wild", "hectic"], antonyms: ["calm", "controlled", "composed"], difficulty: 3, pos: "adjective", example: "There was a frenzied search through all the cupboards." },
  { word: "fury", definition: "Extreme, violent anger", simpleDefinition: "Incredibly intense, explosive anger", synonyms: ["rage", "anger", "wrath", "ferocity"], antonyms: ["calm", "peace", "contentment"], difficulty: 2, pos: "noun", example: "He shouted in fury when he saw the damage." },
  { word: "gaunt", definition: "Extremely thin and bony through hunger or illness", simpleDefinition: "Very thin and bony — looks unhealthy", synonyms: ["thin", "haggard", "emaciated", "hollow-cheeked"], antonyms: ["plump", "robust", "sturdy"], difficulty: 3, pos: "adjective", example: "After weeks without food, the survivors looked gaunt." },
  { word: "genial", definition: "Friendly and cheerful; pleasantly warm", simpleDefinition: "Warm, kind and easy to get along with", synonyms: ["friendly", "cheerful", "warm", "amiable"], antonyms: ["cold", "unfriendly", "stern"], difficulty: 3, pos: "adjective", example: "The genial host made everyone feel at home." },
  { word: "generous", definition: "Willing to give more than is expected; kind and unselfish", simpleDefinition: "Happy to share and give — not keeping things just for yourself", synonyms: ["kind", "giving", "charitable", "bountiful"], antonyms: ["mean", "stingy", "selfish"], difficulty: 1, pos: "adjective", example: "The generous teacher gave up her lunch break to help." },
  { word: "gloom", definition: "Darkness; sadness and depression", simpleDefinition: "Darkness and sadness — when everything feels miserable", synonyms: ["darkness", "sadness", "depression", "bleakness"], antonyms: ["brightness", "joy", "cheerfulness"], difficulty: 2, pos: "noun", example: "A sense of gloom settled over the house." },
  { word: "gracious", definition: "Kind and courteous; pleasantly polite", simpleDefinition: "Polite and kind — especially to people who have less power than you", synonyms: ["courteous", "polite", "kind", "generous"], antonyms: ["rude", "ungracious", "discourteous"], difficulty: 3, pos: "adjective", example: "The gracious hostess welcomed her guests warmly." },
  { word: "gratitude", definition: "The quality of being thankful; readiness to show appreciation", simpleDefinition: "Feeling thankful and showing it", synonyms: ["thankfulness", "appreciation", "gratefulness"], antonyms: ["ingratitude", "thanklessness"], difficulty: 2, pos: "noun", example: "She expressed her gratitude for their kindness." },
  { word: "grief", definition: "Deep sorrow, especially from bereavement", simpleDefinition: "Very deep sadness — especially when someone you love dies", synonyms: ["sorrow", "mourning", "anguish", "heartache"], antonyms: ["joy", "happiness", "celebration"], difficulty: 2, pos: "noun", example: "She was overcome with grief at the loss of her pet." },
  { word: "grim", definition: "Stern or forbidding; not pleasant or hopeful", simpleDefinition: "Very serious and a bit scary — not cheerful at all", synonyms: ["stern", "forbidding", "severe", "bleak"], antonyms: ["cheerful", "bright", "pleasant"], difficulty: 2, pos: "adjective", example: "The news was grim — no survivors had been found." },
  { word: "gruesome", definition: "Causing disgust or horror; very unpleasant", simpleDefinition: "Horrible and disgusting — very hard to look at or hear about", synonyms: ["horrifying", "ghastly", "grisly", "macabre"], antonyms: ["pleasant", "lovely", "delightful"], difficulty: 2, pos: "adjective", example: "The gruesome scene in the film made children look away." },
  { word: "hapless", definition: "Unfortunate; having no luck", simpleDefinition: "Really unlucky — things just never go right", synonyms: ["unlucky", "unfortunate", "luckless", "wretched"], antonyms: ["lucky", "fortunate", "blessed"], difficulty: 3, pos: "adjective", example: "The hapless student arrived on the wrong day." },
  { word: "hardy", definition: "Capable of enduring difficult conditions; robust", simpleDefinition: "Strong and tough — able to survive in hard conditions", synonyms: ["tough", "robust", "rugged", "resilient"], antonyms: ["frail", "weak", "delicate"], difficulty: 3, pos: "adjective", example: "The hardy sheep survived the cold winter on the mountain." },
  { word: "harsh", definition: "Cruel and severe; rough and unpleasant", simpleDefinition: "Really tough and not gentle — rough or cruel", synonyms: ["severe", "strict", "cruel", "rough"], antonyms: ["gentle", "kind", "lenient", "mild"], difficulty: 2, pos: "adjective", example: "The harsh winter made life difficult for many animals." },
  { word: "harrowing", definition: "Intensely distressing or traumatic", simpleDefinition: "So upsetting and scary it's really hard to deal with", synonyms: ["distressing", "traumatic", "agonising", "horrifying"], antonyms: ["pleasant", "comforting", "uplifting"], difficulty: 3, pos: "adjective", example: "She gave a harrowing account of her escape." },
  { word: "havoc", definition: "Widespread destruction and disorder", simpleDefinition: "Total chaos and destruction everywhere", synonyms: ["chaos", "destruction", "mayhem", "disorder"], antonyms: ["order", "peace", "calm"], difficulty: 3, pos: "noun", example: "The tornado caused havoc in the town." },
  { word: "haughty", definition: "Arrogantly superior and disdainful", simpleDefinition: "Acting like you're much better than everyone else", synonyms: ["arrogant", "proud", "contemptuous", "superior"], antonyms: ["humble", "modest", "respectful"], difficulty: 3, pos: "adjective", example: "The haughty prince dismissed the advice of his servants." },
  { word: "hinder", definition: "To create difficulties for someone; to slow down progress", simpleDefinition: "To slow someone down or get in their way", synonyms: ["obstruct", "block", "impede", "hamper"], antonyms: ["help", "assist", "encourage", "support"], difficulty: 3, pos: "verb", example: "The heavy rain hindered their progress." },
  { word: "hostile", definition: "Unfriendly and aggressive; showing strong opposition", simpleDefinition: "Very unfriendly — acting like you're against someone", synonyms: ["unfriendly", "aggressive", "antagonistic", "threatening"], antonyms: ["friendly", "welcoming", "warm"], difficulty: 2, pos: "adjective", example: "The crowd turned hostile when the decision was announced." },
  { word: "humility", definition: "A modest opinion of yourself; not being too proud", simpleDefinition: "Being modest — not thinking you're better than others", synonyms: ["modesty", "humbleness", "meekness"], antonyms: ["arrogance", "pride", "vanity"], difficulty: 3, pos: "noun", example: "He accepted the prize with great humility." },
  { word: "illuminate", definition: "To light up; to make something clearer to understand", simpleDefinition: "To light something up, or to help explain something clearly", synonyms: ["brighten", "clarify", "explain", "enlighten"], antonyms: ["darken", "obscure", "confuse"], difficulty: 3, pos: "verb", example: "Candles illuminated the dark room." },
  { word: "implore", definition: "To beg someone urgently to do something", simpleDefinition: "To beg desperately — really pleading with someone", synonyms: ["beg", "plead", "beseech", "entreat"], antonyms: ["demand", "command", "order"], difficulty: 3, pos: "verb", example: "She implored him not to leave." },
  { word: "impetuous", definition: "Acting or done quickly without thinking; rash", simpleDefinition: "Rushing in without thinking — doing things too quickly", synonyms: ["rash", "impulsive", "hasty", "reckless"], antonyms: ["cautious", "careful", "considered", "measured"], difficulty: 3, pos: "adjective", example: "His impetuous decision landed him in trouble." },
  { word: "impulsive", definition: "Acting on sudden desires without thinking them through", simpleDefinition: "Doing things on the spur of the moment without thinking", synonyms: ["rash", "spontaneous", "hasty", "impetuous"], antonyms: ["cautious", "deliberate", "considered"], difficulty: 3, pos: "adjective", example: "She regretted her impulsive remark." },
  { word: "indifferent", definition: "Having no particular interest or sympathy; uncaring", simpleDefinition: "Not caring one way or another — it doesn't matter to you", synonyms: ["uncaring", "apathetic", "disinterested", "neutral"], antonyms: ["concerned", "interested", "caring", "passionate"], difficulty: 3, pos: "adjective", example: "He seemed indifferent to the suffering around him." },
  { word: "industrious", definition: "Hard-working and diligent", simpleDefinition: "Always busy working hard — never sitting idle", synonyms: ["hardworking", "diligent", "active", "productive"], antonyms: ["lazy", "idle", "sluggish"], difficulty: 3, pos: "adjective", example: "The industrious student finished all her work early." },
  { word: "ingenious", definition: "Very clever, original, and inventive", simpleDefinition: "Brilliantly clever — coming up with creative and smart ideas", synonyms: ["clever", "inventive", "creative", "resourceful"], antonyms: ["unimaginative", "stupid", "dull"], difficulty: 3, pos: "adjective", example: "The ingenious design solved the problem brilliantly." },
  { word: "injustice", definition: "Lack of fairness; an unjust act", simpleDefinition: "Something unfair — when someone is treated badly without reason", synonyms: ["unfairness", "wrongdoing", "inequality", "prejudice"], antonyms: ["justice", "fairness", "equality"], difficulty: 2, pos: "noun", example: "She protested against the injustice of the punishment." },
  { word: "insatiable", definition: "Impossible to satisfy; always wanting more", simpleDefinition: "Never satisfied — always wanting more and more", synonyms: ["greedy", "voracious", "unquenchable", "relentless"], antonyms: ["satisfied", "content", "fulfilled"], difficulty: 3, pos: "adjective", example: "He had an insatiable appetite for knowledge." },
  { word: "inquisitive", definition: "Curious; eager to learn or know more", simpleDefinition: "Really curious — always asking questions and wanting to know things", synonyms: ["curious", "enquiring", "questioning", "nosy"], antonyms: ["uninterested", "incurious", "indifferent"], difficulty: 2, pos: "adjective", example: "The inquisitive pupil asked many questions." },
  { word: "integrity", definition: "The quality of being honest and having strong moral principles", simpleDefinition: "Being honest and doing the right thing even when no one is watching", synonyms: ["honesty", "uprightness", "virtue", "honour"], antonyms: ["dishonesty", "corruption", "immorality"], difficulty: 3, pos: "noun", example: "His integrity made him respected by all." },
  { word: "intimidate", definition: "To frighten someone in order to make them do what you want", simpleDefinition: "To make someone scared so they do what you say", synonyms: ["threaten", "frighten", "bully", "coerce"], antonyms: ["encourage", "reassure", "comfort"], difficulty: 3, pos: "verb", example: "The older pupils tried to intimidate the newcomers." },
  { word: "jeopardy", definition: "Danger of loss, harm, or failure", simpleDefinition: "In danger of something bad happening", synonyms: ["danger", "risk", "peril", "hazard"], antonyms: ["safety", "security", "protection"], difficulty: 3, pos: "noun", example: "His carelessness put the whole mission in jeopardy." },
  { word: "jubilant", definition: "Feeling or expressing great happiness; joyful", simpleDefinition: "Overjoyed and celebrating — feeling like jumping for joy", synonyms: ["joyful", "elated", "ecstatic", "triumphant"], antonyms: ["miserable", "dejected", "despondent"], difficulty: 3, pos: "adjective", example: "The jubilant crowd cheered as the team won." },
  { word: "just", definition: "Behaving according to what is right; fair", simpleDefinition: "Treating everyone fairly — doing the right thing", synonyms: ["fair", "righteous", "honest", "equitable"], antonyms: ["unjust", "unfair", "corrupt", "biased"], difficulty: 1, pos: "adjective", example: "The judge was known for being just and fair." },
  { word: "languid", definition: "Having or showing a disinclination to exert energy", simpleDefinition: "Tired and slow — doing everything lazily", synonyms: ["lethargic", "sluggish", "listless", "weary"], antonyms: ["energetic", "lively", "vigorous"], difficulty: 3, pos: "adjective", example: "She moved in a languid way in the summer heat." },
  { word: "loathe", definition: "To feel intense dislike or disgust for something", simpleDefinition: "To really, really hate something or someone", synonyms: ["hate", "detest", "despise", "abhor"], antonyms: ["love", "adore", "cherish"], difficulty: 3, pos: "verb", example: "He loathed the taste of Brussels sprouts." },
  { word: "lucid", definition: "Easy to understand; clear; expressed clearly", simpleDefinition: "Clear and easy to understand — no confusion at all", synonyms: ["clear", "coherent", "transparent", "intelligible"], antonyms: ["confusing", "muddled", "unclear", "vague"], difficulty: 3, pos: "adjective", example: "She gave a lucid explanation of the problem." },
  { word: "magnanimous", definition: "Very generous and forgiving, especially towards a rival", simpleDefinition: "Being very kind and forgiving, even to people you've beaten", synonyms: ["generous", "forgiving", "noble", "gracious"], antonyms: ["petty", "mean-spirited", "vengeful"], difficulty: 3, pos: "adjective", example: "The magnanimous winner praised his defeated opponent." },
  { word: "majestic", definition: "Having impressive beauty or scale; grand and dignified", simpleDefinition: "Grand and impressive — makes you feel amazed", synonyms: ["grand", "impressive", "stately", "glorious"], antonyms: ["ordinary", "humble", "unimpressive"], difficulty: 2, pos: "adjective", example: "The majestic waterfall thundered into the valley below." },
  { word: "malevolent", definition: "Having or showing a wish to do evil; harmful", simpleDefinition: "Wanting to cause harm and suffering to others", synonyms: ["evil", "malicious", "spiteful", "wicked"], antonyms: ["kind", "benevolent", "good-natured"], difficulty: 3, pos: "adjective", example: "The malevolent villain plotted against the villagers." },
  { word: "manipulate", definition: "To control or influence someone in a clever, unfair way", simpleDefinition: "To cleverly control someone to get what you want", synonyms: ["control", "influence", "exploit", "manoeuvre"], difficulty: 3, pos: "verb", example: "She tried to manipulate the situation to her advantage." },
  { word: "meek", definition: "Quiet, gentle, and not wanting to argue", simpleDefinition: "Very quiet and gentle — doesn't stand up for themselves", synonyms: ["mild", "timid", "gentle", "submissive"], antonyms: ["bold", "confident", "assertive"], difficulty: 2, pos: "adjective", example: "The meek child never argued with his teachers." },
  { word: "mischievous", definition: "Causing trouble in a playful, not very serious way", simpleDefinition: "Naughty in a fun way — enjoying a bit of cheeky trouble", synonyms: ["naughty", "impish", "playful", "cheeky"], antonyms: ["well-behaved", "sensible", "good"], difficulty: 2, pos: "adjective", example: "The mischievous twins swapped their name badges." },
  { word: "mock", definition: "To tease or laugh at in a contemptuous way", simpleDefinition: "To make fun of someone in a mean way", synonyms: ["ridicule", "taunt", "scoff", "jeer"], antonyms: ["praise", "compliment", "respect"], difficulty: 2, pos: "verb", example: "The bullies mocked him for his accent." },
  { word: "monarch", definition: "A king or queen who rules a country", simpleDefinition: "A king or queen — the ruler of a country", synonyms: ["king", "queen", "sovereign", "ruler"], antonyms: ["subject", "citizen"], difficulty: 2, pos: "noun", example: "The monarch waved to the crowd from the palace balcony." },
  { word: "motive", definition: "A reason for doing something, especially something wrong", simpleDefinition: "The reason why someone did something", synonyms: ["reason", "cause", "purpose", "incentive"], antonyms: ["aimlessness", "randomness"], difficulty: 2, pos: "noun", example: "The detective tried to find the motive for the crime." },
  { word: "mournful", definition: "Feeling or expressing deep sadness", simpleDefinition: "Deeply sad — showing a lot of grief", synonyms: ["sorrowful", "sad", "melancholy", "grieving"], antonyms: ["joyful", "cheerful", "happy"], difficulty: 3, pos: "adjective", example: "The mournful song made everyone feel emotional." },
  { word: "naive", definition: "Lacking experience and showing too much trust", simpleDefinition: "Not knowing about the world yet — too trusting and simple", synonyms: ["innocent", "inexperienced", "gullible", "simple"], antonyms: ["worldly", "shrewd", "experienced", "cynical"], difficulty: 2, pos: "adjective", example: "She was naive to believe everything she was told." },
  { word: "nonchalant", definition: "Casually calm and unconcerned; not flustered", simpleDefinition: "Acting completely cool and unbothered — like nothing matters", synonyms: ["casual", "calm", "relaxed", "indifferent"], antonyms: ["anxious", "concerned", "worried", "flustered"], difficulty: 3, pos: "adjective", example: "He tried to seem nonchalant but was secretly terrified." },
  { word: "nuisance", definition: "A person, thing, or circumstance causing inconvenience", simpleDefinition: "Something or someone really annoying", synonyms: ["annoyance", "bother", "irritation", "pest"], antonyms: ["help", "pleasure", "blessing"], difficulty: 2, pos: "noun", example: "The constant noise next door was a real nuisance." },
  { word: "oblivious", definition: "Not aware of or not concerned about what is happening", simpleDefinition: "Completely unaware of what's going on around you", synonyms: ["unaware", "ignorant", "inattentive", "heedless"], antonyms: ["aware", "conscious", "alert", "attentive"], difficulty: 3, pos: "adjective", example: "She was oblivious to the chaos around her." },
  { word: "ominous", definition: "Suggesting that something bad is about to happen", simpleDefinition: "Feeling like something bad is going to happen", synonyms: ["threatening", "foreboding", "sinister", "menacing"], antonyms: ["reassuring", "promising", "hopeful"], difficulty: 3, pos: "adjective", example: "The dark clouds were an ominous sign." },
  { word: "overwhelm", definition: "To defeat someone completely; to overpower feelings", simpleDefinition: "To completely overpower or beat someone or something", synonyms: ["overpower", "overcome", "swamp", "crush"], antonyms: ["fail", "struggle", "yield"], difficulty: 2, pos: "verb", example: "The team was overwhelmed by their rivals in the final." },
  { word: "peevish", definition: "Easily irritated; childishly sulky", simpleDefinition: "Being grumpy and easily annoyed over small things", synonyms: ["irritable", "grumpy", "tetchy", "sulky"], antonyms: ["cheerful", "good-natured", "patient"], difficulty: 3, pos: "adjective", example: "He was peevish all morning because he missed breakfast." },
  { word: "persecute", definition: "To treat someone with cruelty, especially because of beliefs", simpleDefinition: "To keep treating someone very cruelly over and over", synonyms: ["oppress", "victimise", "bully", "torment"], antonyms: ["protect", "support", "help"], difficulty: 3, pos: "verb", example: "The group was persecuted for its beliefs." },
  { word: "petulant", definition: "Childishly sulky or bad-tempered", simpleDefinition: "Sulking and behaving like a little child when you don't get your way", synonyms: ["sulky", "sullen", "irritable", "peevish"], antonyms: ["cheerful", "good-natured", "mature"], difficulty: 3, pos: "adjective", example: "She gave a petulant pout when told she couldn't come." },
  { word: "placid", definition: "Not easily upset or excited; calm and peaceful", simpleDefinition: "Very calm and peaceful — nothing upsets you easily", synonyms: ["calm", "serene", "peaceful", "tranquil"], antonyms: ["agitated", "excitable", "tempestuous"], difficulty: 3, pos: "adjective", example: "The placid lake reflected the mountains above." },
  { word: "plead", definition: "To make an emotional appeal; to beg", simpleDefinition: "To beg someone to do something or to not do something", synonyms: ["beg", "implore", "appeal", "entreat"], antonyms: ["demand", "order", "command"], difficulty: 2, pos: "verb", example: "He pleaded with the teacher for more time." },
  { word: "plight", definition: "A dangerous, difficult, or unfortunate situation", simpleDefinition: "A sad or difficult situation that's hard to get out of", synonyms: ["predicament", "difficulty", "hardship", "trouble"], antonyms: ["ease", "comfort", "fortune"], difficulty: 3, pos: "noun", example: "The charity helped people in terrible plight." },
  { word: "poverty", definition: "The state of being extremely poor", simpleDefinition: "Being very poor — not having enough food, clothes or money", synonyms: ["destitution", "deprivation", "hardship", "penury"], antonyms: ["wealth", "prosperity", "abundance"], difficulty: 2, pos: "noun", example: "Many families lived in poverty at that time." },
  { word: "pragmatic", definition: "Dealing with things sensibly and practically", simpleDefinition: "Being practical and realistic — not getting lost in ideas", synonyms: ["practical", "sensible", "realistic", "down-to-earth"], antonyms: ["idealistic", "impractical", "unrealistic"], difficulty: 3, pos: "adjective", example: "She took a pragmatic approach to the problem." },
  { word: "privilege", definition: "A special right or advantage available to a particular person", simpleDefinition: "A special advantage that not everyone gets to have", synonyms: ["advantage", "benefit", "right", "luxury"], antonyms: ["disadvantage", "penalty", "restriction"], difficulty: 2, pos: "noun", example: "It was a privilege to meet the author." },
  { word: "prophecy", definition: "A prediction about what will happen in the future", simpleDefinition: "A prediction about the future — what someone says will happen", synonyms: ["prediction", "forecast", "foretelling", "vision"], antonyms: ["history", "fact", "certainty"], difficulty: 3, pos: "noun", example: "The old prophecy said a great hero would arrive." },
  { word: "pursue", definition: "To follow or chase someone or something; to continue with", simpleDefinition: "To follow or chase something — or to keep trying to get it", synonyms: ["chase", "follow", "seek", "hunt"], antonyms: ["abandon", "flee", "retreat"], difficulty: 2, pos: "verb", example: "She decided to pursue a career in medicine." },
  { word: "querulous", definition: "Complaining in a petulant or whining manner", simpleDefinition: "Always complaining and whining about things", synonyms: ["complaining", "whining", "grumbling", "peevish"], antonyms: ["content", "cheerful", "uncomplaining"], difficulty: 3, pos: "adjective", example: "The querulous customer complained about everything." },
  { word: "radiant", definition: "Sending out light; clearly very happy and joyful", simpleDefinition: "Glowing with happiness or light — bright and beaming", synonyms: ["glowing", "beaming", "bright", "shining"], antonyms: ["gloomy", "dull"], difficulty: 2, pos: "adjective", example: "She looked radiant on her wedding day." },
  { word: "rebel", definition: "To resist authority or control; to act in opposition", simpleDefinition: "To refuse to follow the rules and fight back", synonyms: ["defy", "revolt", "resist", "oppose"], antonyms: ["obey", "comply", "conform"], difficulty: 2, pos: "verb", example: "The students rebelled against the strict new timetable." },
  { word: "reckless", definition: "Without thinking or caring about the consequences", simpleDefinition: "Not caring about danger — taking big risks without thinking", synonyms: ["careless", "rash", "impulsive", "irresponsible"], antonyms: ["careful", "cautious", "responsible"], difficulty: 2, pos: "adjective", example: "His reckless driving put everyone in danger." },
  { word: "reconcile", definition: "To restore friendly relations between people; to accept", simpleDefinition: "To make peace between people who have argued", synonyms: ["reunite", "settle", "resolve", "harmonise"], antonyms: ["estrange", "divide"], difficulty: 3, pos: "verb", example: "The friends reconciled after their argument." },
  { word: "refuge", definition: "A safe place from danger or trouble; shelter", simpleDefinition: "A place where you can go to be safe from danger", synonyms: ["shelter", "sanctuary", "haven", "retreat"], antonyms: ["danger", "exposure", "threat"], difficulty: 2, pos: "noun", example: "They found refuge from the storm in a barn." },
  { word: "remedy", definition: "A solution to a problem or cure for an illness", simpleDefinition: "Something that fixes a problem or cures an illness", synonyms: ["cure", "solution", "fix", "treatment"], antonyms: ["problem", "cause", "damage"], difficulty: 2, pos: "noun", example: "The doctor prescribed a remedy for his cold." },
  { word: "remorse", definition: "Deep regret for something wrong that you have done", simpleDefinition: "Feeling very guilty and sorry for something bad you did", synonyms: ["regret", "guilt", "repentance", "shame"], antonyms: ["shamelessness", "indifference", "pride"], difficulty: 3, pos: "noun", example: "He was full of remorse after hurting his friend." },
  { word: "repel", definition: "To drive or force back; to cause distaste or disgust", simpleDefinition: "To push something away or make someone feel disgusted", synonyms: ["repulse", "reject", "disgust", "revolt"], antonyms: ["attract", "welcome", "invite"], difficulty: 3, pos: "verb", example: "The strong smell repelled anyone who came near." },
  { word: "resolute", definition: "Admirably purposeful, determined, and unwavering", simpleDefinition: "Completely determined — nothing can change your mind", synonyms: ["determined", "firm", "steadfast", "unwavering"], antonyms: ["wavering", "indecisive", "weak"], difficulty: 3, pos: "adjective", example: "She was resolute in her decision not to give up." },
  { word: "ruthless", definition: "Having no pity or compassion; merciless", simpleDefinition: "Completely without mercy — doesn't care who gets hurt", synonyms: ["merciless", "cruel", "heartless", "pitiless"], antonyms: ["merciful", "compassionate", "kind"], difficulty: 3, pos: "adjective", example: "The ruthless commander showed no mercy." },
  { word: "sacrifice", definition: "Giving up something valued for a greater cause", simpleDefinition: "Giving up something important for someone or something else", synonyms: ["offering", "forfeit", "surrender", "loss"], antonyms: ["gain", "keep", "preserve"], difficulty: 2, pos: "noun", example: "She made great sacrifices for her family." },
  { word: "scornful", definition: "Feeling or showing contempt or derision", simpleDefinition: "Looking down on something with contempt and disrespect", synonyms: ["contemptuous", "disdainful", "mocking", "dismissive"], antonyms: ["respectful", "admiring", "appreciative"], difficulty: 3, pos: "adjective", example: "He gave a scornful laugh at the suggestion." },
  { word: "solemn", definition: "Formal and dignified; deeply serious", simpleDefinition: "Very serious and formal — not the time for jokes", synonyms: ["serious", "formal", "grave", "dignified"], antonyms: ["cheerful", "silly", "casual", "informal"], difficulty: 3, pos: "adjective", example: "The ceremony was a solemn occasion." },
  { word: "solitude", definition: "The state of being alone, especially when peaceful", simpleDefinition: "Being on your own — alone but maybe enjoying the peace", synonyms: ["loneliness", "isolation", "seclusion", "privacy"], antonyms: ["company", "sociability", "togetherness"], difficulty: 3, pos: "noun", example: "She enjoyed the solitude of the empty beach." },
  { word: "sorrow", definition: "A feeling of deep distress caused by loss or disappointment", simpleDefinition: "A deep feeling of sadness", synonyms: ["sadness", "grief", "misery", "heartache"], antonyms: ["joy", "happiness", "delight"], difficulty: 2, pos: "noun", example: "He felt great sorrow when his old friend moved away." },
  { word: "spectacle", definition: "A visually striking or impressive event or scene", simpleDefinition: "A scene or event that's really impressive to watch", synonyms: ["scene", "display", "show", "sight"], antonyms: ["obscurity", "normalcy"], difficulty: 3, pos: "noun", example: "The fireworks were a magnificent spectacle." },
  { word: "stern", definition: "Strict and serious; showing disapproval", simpleDefinition: "Strict and serious — not smiling or being friendly", synonyms: ["strict", "harsh", "severe", "serious"], antonyms: ["kind", "gentle", "lenient", "warm"], difficulty: 2, pos: "adjective", example: "The stern teacher did not tolerate any noise." },
  { word: "stoic", definition: "Enduring hardship without complaining or showing emotion", simpleDefinition: "Accepting pain and difficulty without showing how you feel", synonyms: ["resilient", "impassive", "calm", "unemotional"], antonyms: ["emotional", "complaining", "dramatic"], difficulty: 3, pos: "adjective", example: "She was stoic throughout the long, painful treatment." },
  { word: "strife", definition: "Angry or bitter disagreement; conflict", simpleDefinition: "A lot of fighting and arguing between people", synonyms: ["conflict", "discord", "disagreement", "quarrelling"], antonyms: ["peace", "harmony", "agreement"], difficulty: 3, pos: "noun", example: "Years of strife had exhausted the whole community." },
  { word: "sullen", definition: "Bad-tempered and sulky; gloomy", simpleDefinition: "Miserable and refusing to talk or smile — sulking", synonyms: ["sulky", "moody", "gloomy", "surly"], antonyms: ["cheerful", "bright", "friendly"], difficulty: 2, pos: "adjective", example: "She sat in sullen silence throughout the meal." },
  { word: "suppress", definition: "To stop by force; to hold back an emotion or reaction", simpleDefinition: "To stop something from being shown or heard by force", synonyms: ["quash", "crush", "silence", "stifle"], antonyms: ["encourage", "allow", "support"], difficulty: 3, pos: "verb", example: "She tried to suppress a smile at his joke." },
  { word: "suspicious", definition: "Feeling doubt or distrust; having a feeling that something is wrong", simpleDefinition: "Feeling like something isn't right — not trusting it", synonyms: ["distrustful", "doubtful", "wary", "sceptical"], antonyms: ["trusting", "confident", "certain"], difficulty: 2, pos: "adjective", example: "She was suspicious of the man lurking outside." },
  { word: "sympathetic", definition: "Showing care and understanding for someone in distress", simpleDefinition: "Being kind and understanding when someone is upset", synonyms: ["caring", "understanding", "compassionate", "kind"], antonyms: ["unsympathetic", "indifferent", "callous"], difficulty: 2, pos: "adjective", example: "Her teacher was sympathetic about her difficult week." },
  { word: "timid", definition: "Lacking confidence or courage; shy", simpleDefinition: "Too shy or scared to be bold — nervous and hesitant", synonyms: ["shy", "nervous", "meek", "fearful"], antonyms: ["bold", "confident", "daring", "brave"], difficulty: 2, pos: "adjective", example: "The timid mouse peered out from behind the skirting board." },
  { word: "toil", definition: "To work very hard for a long time", simpleDefinition: "To work really hard for a very long time", synonyms: ["labour", "strive", "slave", "grind"], antonyms: ["rest", "relax", "play"], difficulty: 3, pos: "verb", example: "The workers toiled in the fields all day." },
  { word: "torment", definition: "Severe physical or mental suffering; to cause this suffering", simpleDefinition: "Very great pain or suffering, or to cause someone to feel this", synonyms: ["torture", "suffering", "agony", "misery"], antonyms: ["comfort", "relief", "pleasure"], difficulty: 3, pos: "noun", example: "The waiting was pure torment." },
  { word: "tranquil", definition: "Free from disturbance; calm and quiet", simpleDefinition: "Peaceful and calm — completely undisturbed", synonyms: ["peaceful", "calm", "serene", "still"], antonyms: ["turbulent", "noisy", "chaotic", "agitated"], difficulty: 2, pos: "adjective", example: "The garden was tranquil in the early morning." },
  { word: "treacherous", definition: "Very dangerous or unreliable; guilty of betrayal", simpleDefinition: "Not to be trusted, or extremely dangerous and unpredictable", synonyms: ["dangerous", "untrustworthy", "disloyal", "hazardous"], antonyms: ["trustworthy", "reliable", "safe", "loyal"], difficulty: 3, pos: "adjective", example: "The treacherous ice made the path very dangerous." },
  { word: "triumph", definition: "A great victory or achievement; to achieve this", simpleDefinition: "A brilliant win or success — something to really celebrate", synonyms: ["victory", "success", "win", "achievement"], antonyms: ["defeat", "failure", "loss"], difficulty: 2, pos: "noun", example: "Their triumph at the finals was celebrated by the whole school." },
  { word: "tyranny", definition: "Cruel and oppressive rule by one person with total power", simpleDefinition: "Being ruled by someone cruel and unfair who has all the power", synonyms: ["oppression", "despotism", "cruelty", "dictatorship"], antonyms: ["democracy", "freedom", "fairness"], difficulty: 3, pos: "noun", example: "The citizens rose up against the tyranny of their ruler." },
  { word: "tyrant", definition: "A cruel and oppressive ruler who uses power unfairly", simpleDefinition: "A cruel ruler who uses power to bully and control others", synonyms: ["dictator", "despot", "oppressor", "bully"], antonyms: ["liberator", "democrat", "servant"], difficulty: 3, pos: "noun", example: "The people suffered under the iron rule of the tyrant." },
  { word: "unruly", definition: "Difficult to control; disorderly and disobedient", simpleDefinition: "Not following rules — wild and out of control", synonyms: ["disobedient", "disorderly", "uncontrollable", "wild"], antonyms: ["obedient", "well-behaved", "controlled"], difficulty: 3, pos: "adjective", example: "The unruly crowd pushed past the barriers." },
  { word: "valiant", definition: "Brave, especially in the face of danger", simpleDefinition: "Brave and courageous — not giving up despite the danger", synonyms: ["brave", "courageous", "heroic", "gallant"], antonyms: ["cowardly", "timid", "afraid"], difficulty: 3, pos: "adjective", example: "The valiant knight defended the castle alone." },
  { word: "vengeance", definition: "Punishment inflicted for a wrong; revenge", simpleDefinition: "Getting back at someone for something they did wrong", synonyms: ["revenge", "retribution", "retaliation", "reprisal"], antonyms: ["forgiveness", "mercy", "pardon"], difficulty: 3, pos: "noun", example: "He swore vengeance on those who had wronged him." },
  { word: "vengeful", definition: "Seeking to harm someone as punishment for something bad they did", simpleDefinition: "Wanting to get your own back on someone — full of desire for revenge", synonyms: ["vindictive", "unforgiving", "bitter", "spiteful"], antonyms: ["forgiving", "merciful", "gentle"], difficulty: 3, pos: "adjective", example: "The vengeful queen plotted her enemy's downfall." },
  { word: "verdict", definition: "A decision on an issue, especially in a legal case", simpleDefinition: "The final decision — especially in court", synonyms: ["decision", "judgement", "ruling", "conclusion"], antonyms: ["question", "uncertainty", "indecision"], difficulty: 2, pos: "noun", example: "The jury returned a verdict of not guilty." },
  { word: "vigour", definition: "Physical strength and good health; energy and determination", simpleDefinition: "Energy, strength and enthusiasm in everything you do", synonyms: ["energy", "strength", "vitality", "enthusiasm"], antonyms: ["weakness", "lethargy", "sluggishness"], difficulty: 3, pos: "noun", example: "She tackled the challenge with great vigour." },
  { word: "wistful", definition: "Having a feeling of longing or regret for something past", simpleDefinition: "Feeling a gentle sadness about something you miss", synonyms: ["nostalgic", "longing", "pensive", "yearning"], antonyms: ["content", "satisfied", "cheerful"], difficulty: 3, pos: "adjective", example: "She gave a wistful smile as she looked at the old photos." },
  { word: "zealous", definition: "Having or showing great enthusiasm for a cause", simpleDefinition: "Really enthusiastic and passionate about something", synonyms: ["enthusiastic", "passionate", "fervent", "devoted"], antonyms: ["indifferent", "apathetic"], difficulty: 3, pos: "adjective", example: "She was a zealous supporter of animal rights." },
  { word: "accolade", definition: "An award or expression of praise or admiration", simpleDefinition: "Recognition for doing something well — praise or an award", synonyms: ["praise", "award", "honour", "tribute"], antonyms: ["criticism", "blame", "rebuke"], difficulty: 3, pos: "noun", example: "She received many accolades for her outstanding work." },
  { word: "agony", definition: "Extreme physical or mental suffering", simpleDefinition: "The worst kind of pain — absolutely unbearable", synonyms: ["torment", "suffering", "anguish", "pain"], antonyms: ["comfort", "relief", "pleasure"], difficulty: 2, pos: "noun", example: "He was in agony after twisting his ankle." },
  { word: "blunder", definition: "A stupid or careless mistake", simpleDefinition: "A big, clumsy mistake caused by not thinking carefully", synonyms: ["mistake", "error", "gaffe", "slip"], antonyms: ["success", "achievement", "triumph"], difficulty: 2, pos: "noun", example: "Forgetting her lines was a terrible blunder." },
  { word: "captive", definition: "A person who has been captured and is held prisoner", simpleDefinition: "Someone who has been caught and cannot get free", synonyms: ["prisoner", "hostage", "detainee", "inmate"], antonyms: ["liberator", "rescuer"], difficulty: 2, pos: "noun", example: "The captive waited hopefully for rescue." },
  { word: "dejected", definition: "Sad and dispirited; low in spirits", simpleDefinition: "Feeling down and disappointed — like all the hope has gone", synonyms: ["downcast", "despondent", "miserable", "disheartened"], antonyms: ["cheerful", "hopeful", "elated"], difficulty: 3, pos: "adjective", example: "She looked dejected after hearing the bad news." },
  { word: "demise", definition: "A person's death; the end or failure of something", simpleDefinition: "The death of a person, or the end of something", synonyms: ["death", "end", "passing", "downfall"], antonyms: ["birth", "creation", "rise"], difficulty: 3, pos: "noun", example: "The demise of the old cinema saddened many residents." },
  { word: "despondent", definition: "In low spirits from loss of hope or courage", simpleDefinition: "Feeling completely hopeless and very low", synonyms: ["dejected", "hopeless", "miserable", "downcast"], antonyms: ["cheerful", "optimistic", "hopeful"], difficulty: 3, pos: "adjective", example: "He was despondent after failing his exam." },
  { word: "detrimental", definition: "Tending to cause harm or damage", simpleDefinition: "Harmful — causing damage to something", synonyms: ["harmful", "damaging", "destructive", "adverse"], antonyms: ["beneficial", "helpful", "positive"], difficulty: 3, pos: "adjective", example: "Too much screen time can be detrimental to sleep." },
  { word: "distraught", definition: "Very worried and upset; distracted with fear or worry", simpleDefinition: "Really upset and worried — beside yourself with distress", synonyms: ["distressed", "desperate", "frantic", "overwrought"], antonyms: ["calm", "composed", "untroubled"], difficulty: 3, pos: "adjective", example: "She was distraught when she heard the news." },
  { word: "elaborate", definition: "Involving many carefully arranged parts; detailed and complicated", simpleDefinition: "Really detailed and complicated — a lot of thought has gone into it", synonyms: ["detailed", "complex", "intricate", "involved"], antonyms: ["simple", "plain", "basic"], difficulty: 3, pos: "adjective", example: "The elaborate plan took months to prepare." },
  { word: "falter", definition: "To lose strength; to hesitate in action or speech", simpleDefinition: "To slow down or waver — not feeling sure or strong anymore", synonyms: ["hesitate", "waver", "stumble", "weaken"], antonyms: ["proceed", "advance", "continue", "persevere"], difficulty: 3, pos: "verb", example: "Her voice faltered as she gave the speech." },
  { word: "abject", definition: "Experienced to the maximum degree; utterly hopeless", simpleDefinition: "Completely hopeless and miserable — as bad as it can get", synonyms: ["wretched", "miserable", "hopeless", "pitiful"], antonyms: ["dignified", "proud"], difficulty: 3, pos: "adjective", example: "The refugees lived in abject poverty." },
  { word: "abrupt", definition: "Sudden and unexpected; rudely brief", simpleDefinition: "Sudden and unexpected — or rude and short with people", synonyms: ["sudden", "curt", "brusque", "sharp"], antonyms: ["gradual", "gentle", "courteous"], difficulty: 2, pos: "adjective", example: "His abrupt reply surprised everyone in the room." },
  { word: "acrimonious", definition: "Angry and bitter, especially in speech or manner", simpleDefinition: "Very bitter and angry — full of sharp, hurtful words", synonyms: ["bitter", "hostile", "sharp", "caustic"], antonyms: ["cordial", "amicable", "pleasant"], difficulty: 4, pos: "adjective", example: "The divorce was acrimonious and lasted years." },
  { word: "adamant", definition: "Refusing absolutely to change one's mind", simpleDefinition: "Completely refusing to change your mind — no matter what", synonyms: ["stubborn", "firm", "resolute", "unyielding"], antonyms: ["flexible", "yielding", "compliant"], difficulty: 3, pos: "adjective", example: "She was adamant that she had seen the thief." },
  { word: "adept", definition: "Very skilled or proficient at something", simpleDefinition: "Very skilled and good at something — an expert", synonyms: ["skilled", "expert", "proficient", "capable"], antonyms: ["inept", "unskilled", "clumsy"], difficulty: 3, pos: "adjective", example: "He was adept at solving complex puzzles." },
  { word: "admonish", definition: "To warn or scold someone firmly but not harshly", simpleDefinition: "To tell someone off gently — warning them not to do it again", synonyms: ["warn", "scold", "rebuke", "caution"], antonyms: ["praise", "commend", "encourage"], difficulty: 3, pos: "verb", example: "The teacher admonished the pupil for arriving late." },
  { word: "adroit", definition: "Clever and skilful, especially with the hands or mind", simpleDefinition: "Clever and skilful — able to do tricky things with ease", synonyms: ["skilful", "dexterous", "clever", "nimble"], antonyms: ["clumsy", "inept", "awkward"], difficulty: 3, pos: "adjective", example: "The adroit pickpocket was never caught." },
  { word: "aggravate", definition: "To make a problem worse; to annoy someone", simpleDefinition: "To make something worse — or to really irritate someone", synonyms: ["worsen", "irritate", "inflame", "exacerbate"], antonyms: ["improve", "soothe", "alleviate"], difficulty: 3, pos: "verb", example: "Scratching the wound will only aggravate it." },
  { word: "aggrieved", definition: "Feeling resentment at having been treated unfairly", simpleDefinition: "Feeling upset and wronged — like you've been treated badly", synonyms: ["wronged", "resentful", "offended", "disgruntled"], antonyms: ["satisfied", "content", "appeased"], difficulty: 3, pos: "adjective", example: "The aggrieved employee lodged a formal complaint." },
  { word: "allay", definition: "To reduce or put at rest fear or concern", simpleDefinition: "To calm fears or worries — to make them less frightening", synonyms: ["soothe", "calm", "ease", "relieve"], antonyms: ["intensify", "worsen", "alarm"], difficulty: 3, pos: "verb", example: "The doctor's words helped to allay her fears." },
  { word: "altruistic", definition: "Showing selfless concern for the wellbeing of others", simpleDefinition: "Caring about others more than yourself — selflessly helpful", synonyms: ["selfless", "generous", "charitable", "philanthropic"], antonyms: ["selfish", "greedy", "self-serving"], difficulty: 4, pos: "adjective", example: "Her altruistic nature led her to volunteer every weekend." },
  { word: "ambivalent", definition: "Having mixed or contradictory feelings about something", simpleDefinition: "Having mixed feelings — not sure whether you like something or not", synonyms: ["uncertain", "undecided", "conflicted", "torn"], antonyms: ["certain", "decisive", "resolved"], difficulty: 4, pos: "adjective", example: "She was ambivalent about moving to a new school." },
  { word: "amend", definition: "To change a text or decision to correct or improve it", simpleDefinition: "To improve or correct something — to make it better or fix it", synonyms: ["revise", "alter", "correct", "modify"], antonyms: ["maintain", "preserve"], difficulty: 3, pos: "verb", example: "Parliament voted to amend the law." },
  { word: "animosity", definition: "Strong hostility or dislike", simpleDefinition: "A strong feeling of dislike and anger towards someone", synonyms: ["hostility", "hatred", "enmity", "antagonism"], antonyms: ["friendship", "affection", "goodwill"], difficulty: 3, pos: "noun", example: "There was clear animosity between the two rivals." },
  { word: "apathy", definition: "Lack of interest, enthusiasm, or concern", simpleDefinition: "Not caring or being interested in anything — total indifference", synonyms: ["indifference", "listlessness", "disinterest", "inertia"], antonyms: ["enthusiasm", "passion", "interest"], difficulty: 3, pos: "noun", example: "Voter apathy meant very few people came to the polls." },
  { word: "arrogance", definition: "An exaggerated sense of one's own importance or abilities", simpleDefinition: "Thinking you're much better and more important than everyone else", synonyms: ["conceit", "haughtiness", "pride", "vanity"], antonyms: ["humility", "modesty", "meekness"], difficulty: 2, pos: "noun", example: "His arrogance made him unpopular with his classmates." },
  { word: "astute", definition: "Having clever insight and good judgement", simpleDefinition: "Clever at understanding situations quickly — sharp and perceptive", synonyms: ["shrewd", "perceptive", "sharp", "clever"], antonyms: ["naive", "foolish", "obtuse"], difficulty: 3, pos: "adjective", example: "The astute businesswoman spotted the flaw immediately." },
  { word: "avaricious", definition: "Having an extreme greed for wealth", simpleDefinition: "Extremely greedy for money and wealth — never satisfied", synonyms: ["greedy", "grasping", "covetous", "miserly"], antonyms: ["generous", "charitable", "giving"], difficulty: 4, pos: "adjective", example: "The avaricious landlord raised the rent yet again." },
  { word: "aversion", definition: "A strong dislike or disinclination", simpleDefinition: "A strong dislike of something — wanting to avoid it", synonyms: ["dislike", "hatred", "reluctance", "distaste"], antonyms: ["fondness", "liking", "attraction"], difficulty: 3, pos: "noun", example: "She had a strong aversion to heights." },
  { word: "avid", definition: "Enthusiastic and eager, especially about an interest", simpleDefinition: "Very keen and enthusiastic — really passionate about something", synonyms: ["keen", "eager", "enthusiastic", "passionate"], antonyms: ["indifferent", "apathetic", "reluctant"], difficulty: 2, pos: "adjective", example: "He was an avid reader who never went anywhere without a book." },
  { word: "bashful", definition: "Shy and easily embarrassed; reluctant to draw attention", simpleDefinition: "Shy and easily embarrassed — doesn't like being noticed", synonyms: ["shy", "timid", "coy", "modest"], antonyms: ["bold", "confident", "brazen"], difficulty: 2, pos: "adjective", example: "The bashful child hid behind her mother's legs." },
  { word: "beguile", definition: "To charm or enchant someone, sometimes deceptively", simpleDefinition: "To charm and attract someone — sometimes in a tricky or deceptive way", synonyms: ["charm", "enchant", "deceive", "captivate"], antonyms: ["repel", "repulse"], difficulty: 3, pos: "verb", example: "He beguiled the crowd with his smooth talking." },
  { word: "belligerent", definition: "Eager to fight or argue; hostile and aggressive", simpleDefinition: "Aggressive and looking for a fight — itching to argue", synonyms: ["aggressive", "hostile", "quarrelsome", "combative"], antonyms: ["peaceful", "calm", "placid"], difficulty: 3, pos: "adjective", example: "The belligerent crowd became difficult to control." },
  { word: "berate", definition: "To scold or criticise someone in an angry way", simpleDefinition: "To tell someone off loudly and angrily", synonyms: ["scold", "rebuke", "criticise", "reprimand"], antonyms: ["praise", "commend", "applaud"], difficulty: 3, pos: "verb", example: "The coach berated the team for their poor performance." },
  { word: "beseech", definition: "To ask someone urgently and desperately", simpleDefinition: "To beg desperately — to ask with all your heart", synonyms: ["beg", "implore", "plead", "entreat"], difficulty: 3, pos: "verb", example: "She beseeched him not to leave." },
  { word: "blithe", definition: "Carefree and happy; showing casual disregard", simpleDefinition: "Carefree and cheerful — not worried about anything", synonyms: ["carefree", "cheerful", "casual", "unconcerned"], antonyms: ["anxious", "concerned", "serious"], difficulty: 4, pos: "adjective", example: "She skipped away with blithe disregard for the rules." },
  { word: "bolster", definition: "To support or strengthen something", simpleDefinition: "To prop up or give extra support to something", synonyms: ["strengthen", "support", "reinforce", "boost"], antonyms: ["undermine", "weaken", "hinder"], difficulty: 3, pos: "verb", example: "Extra revision helped to bolster her confidence." },
  { word: "brusque", definition: "Abrupt and off-putting in speech or manner", simpleDefinition: "Rudely short and sharp — not being polite when you speak", synonyms: ["curt", "abrupt", "blunt", "sharp"], antonyms: ["courteous", "polite", "tactful"], difficulty: 3, pos: "adjective", example: "His brusque manner put people off immediately." },
  { word: "cajole", definition: "To persuade someone using flattery or gentle pressure", simpleDefinition: "To persuade someone with flattery — sweet-talking them into something", synonyms: ["coax", "persuade", "wheedle", "flatter"], antonyms: ["force", "coerce", "demand"], difficulty: 3, pos: "verb", example: "She cajoled him into lending her the money." },
  { word: "cantankerous", definition: "Bad-tempered, argumentative, and hard to please", simpleDefinition: "Grumpy and difficult — always ready to argue and complain", synonyms: ["grumpy", "irritable", "quarrelsome", "obstinate"], antonyms: ["cheerful", "agreeable", "pleasant"], difficulty: 3, pos: "adjective", example: "The cantankerous old man argued with everyone." },
  { word: "capitulate", definition: "To stop resisting and give in to demands", simpleDefinition: "To give in — to stop fighting and accept defeat", synonyms: ["surrender", "yield", "concede", "submit"], antonyms: ["resist", "persevere", "defy"], difficulty: 4, pos: "verb", example: "After weeks of negotiation, they finally capitulated." },
  { word: "castigate", definition: "To reprimand or criticise someone severely", simpleDefinition: "To punish or scold someone very harshly", synonyms: ["scold", "rebuke", "censure", "reprimand"], antonyms: ["praise", "commend", "laud"], difficulty: 4, pos: "verb", example: "The report castigated the council for their failures." },
  { word: "caustic", definition: "Sarcastic in a harsh and biting way; corrosive", simpleDefinition: "Harshly sarcastic — able to burn or sting with words", synonyms: ["sarcastic", "biting", "sharp", "scathing"], antonyms: ["mild", "gentle", "kind"], difficulty: 3, pos: "adjective", example: "Her caustic remarks silenced everyone in the room." },
  { word: "celestial", definition: "Relating to the sky or outer space; heavenly", simpleDefinition: "To do with the sky or heavens — beautiful and otherworldly", synonyms: ["heavenly", "divine", "astronomical", "ethereal"], antonyms: ["earthly", "terrestrial"], difficulty: 3, pos: "adjective", example: "Stars and planets are celestial bodies." },
  { word: "censure", definition: "To express severe disapproval of someone officially", simpleDefinition: "To formally and officially criticise someone for doing wrong", synonyms: ["condemn", "criticise", "rebuke", "denounce"], antonyms: ["praise", "commend", "approve"], difficulty: 3, pos: "verb", example: "The politician was censured by parliament." },
  { word: "charitable", definition: "Generous in giving help to those in need; kindly", simpleDefinition: "Generous in helping others — kind and giving to those in need", synonyms: ["generous", "benevolent", "kind", "philanthropic"], antonyms: ["stingy", "cruel", "selfish"], difficulty: 2, pos: "adjective", example: "She was always charitable to those less fortunate." },
  { word: "clandestine", definition: "Kept secret and hidden, especially for bad reasons", simpleDefinition: "Done in secret — hidden away so no one can find out", synonyms: ["secret", "covert", "hidden", "underhand"], antonyms: ["open", "public", "transparent"], difficulty: 4, pos: "adjective", example: "They held clandestine meetings in the cellar." },
  { word: "clemency", definition: "Mercy and leniency shown towards an offender", simpleDefinition: "Showing mercy to someone who has done wrong — being lenient", synonyms: ["mercy", "leniency", "compassion", "forgiveness"], antonyms: ["harshness", "cruelty", "severity"], difficulty: 4, pos: "noun", example: "The judge showed clemency and gave a lighter sentence." },
  { word: "compel", definition: "To force someone to do something against their will", simpleDefinition: "To force someone to do something — they have no choice", synonyms: ["force", "oblige", "coerce", "require"], antonyms: ["dissuade", "discourage", "allow"], difficulty: 2, pos: "verb", example: "Hunger compelled them to eat anything they could find." },
  { word: "compliant", definition: "Obeying rules or instructions without resistance", simpleDefinition: "Doing what you're told without arguing — going along with the rules", synonyms: ["obedient", "submissive", "cooperative", "docile"], antonyms: ["defiant", "rebellious", "resistant"], difficulty: 3, pos: "adjective", example: "The compliant student always followed instructions." },
  { word: "concede", definition: "To admit something is true or to give something up", simpleDefinition: "To admit something is true — or to give up something you claimed", synonyms: ["admit", "acknowledge", "yield", "grant"], antonyms: ["deny", "dispute", "contest"], difficulty: 3, pos: "verb", example: "He conceded that he had been wrong." },
  { word: "condescending", definition: "Showing a feeling of superiority towards others", simpleDefinition: "Acting as if you're better than everyone else — looking down on people", synonyms: ["patronising", "superior", "haughty", "disdainful"], antonyms: ["respectful", "humble", "courteous"], difficulty: 3, pos: "adjective", example: "Her condescending tone made the others feel foolish." },
  { word: "condone", definition: "To accept or allow behaviour that is considered wrong", simpleDefinition: "To allow something wrong to happen without punishing it", synonyms: ["excuse", "overlook", "tolerate", "permit"], antonyms: ["condemn", "forbid", "punish"], difficulty: 3, pos: "verb", example: "The school would not condone bullying of any kind." },
  { word: "congenial", definition: "Pleasant and friendly; suited to your taste", simpleDefinition: "Pleasant and agreeable — someone you get on with easily", synonyms: ["pleasant", "agreeable", "friendly", "affable"], antonyms: ["disagreeable", "hostile", "unpleasant"], difficulty: 3, pos: "adjective", example: "He found his new colleagues very congenial." },
  { word: "conscience", definition: "An inner sense of right and wrong that guides behaviour", simpleDefinition: "Your inner voice that tells you what is right and wrong", synonyms: ["morals", "principles", "scruples"], difficulty: 2, pos: "noun", example: "Her conscience would not allow her to lie." },
  { word: "consensus", definition: "General agreement among a group of people", simpleDefinition: "When everyone in a group agrees on something", synonyms: ["agreement", "unity", "accord", "harmony"], antonyms: ["disagreement", "discord", "conflict"], difficulty: 3, pos: "noun", example: "The committee reached a consensus after long discussion." },
  { word: "contend", definition: "To struggle or compete against; to argue or claim", simpleDefinition: "To struggle against something — or to argue that something is true", synonyms: ["compete", "struggle", "argue", "maintain"], antonyms: ["agree", "concede", "surrender"], difficulty: 3, pos: "verb", example: "She had to contend with many obstacles to succeed." },
  { word: "contrite", definition: "Feeling or showing remorse and sorrow for wrongdoing", simpleDefinition: "Feeling very sorry and ashamed for something you did wrong", synonyms: ["remorseful", "repentant", "sorry", "penitent"], antonyms: ["unrepentant", "shameless", "defiant"], difficulty: 3, pos: "adjective", example: "He was genuinely contrite about his behaviour." },
  { word: "convey", definition: "To communicate or make something known", simpleDefinition: "To pass on or communicate something — to make an idea clear", synonyms: ["communicate", "express", "transmit", "impart"], difficulty: 2, pos: "verb", example: "She struggled to convey how she was feeling." },
  { word: "convivial", definition: "Friendly and lively; relating to good company", simpleDefinition: "Warm and friendly — great fun to be around at social events", synonyms: ["sociable", "friendly", "jovial", "genial"], antonyms: ["unsociable", "hostile", "cold"], difficulty: 4, pos: "adjective", example: "The convivial atmosphere made everyone feel welcome." },
  { word: "copious", definition: "Very abundant; in large quantities", simpleDefinition: "Very large in amount — more than enough", synonyms: ["abundant", "plentiful", "generous", "ample"], antonyms: ["scarce", "meagre", "sparse"], difficulty: 3, pos: "adjective", example: "She took copious notes during the lecture." },
  { word: "cordial", definition: "Warm and friendly in manner", simpleDefinition: "Warm and friendly — polite and pleasant to others", synonyms: ["friendly", "warm", "genial", "affable"], antonyms: ["cold", "hostile", "unfriendly"], difficulty: 2, pos: "adjective", example: "He extended a cordial welcome to all the guests." },
  { word: "credulous", definition: "Too willing to believe things without proof", simpleDefinition: "Too easy to fool — believing things without questioning them", synonyms: ["gullible", "trusting", "naive", "unsuspecting"], antonyms: ["sceptical", "suspicious", "cynical"], difficulty: 3, pos: "adjective", example: "The credulous child believed every story he was told." },
  { word: "curt", definition: "Rudely brief in speech or manner", simpleDefinition: "Rudely short and sharp — giving very little away when you speak", synonyms: ["abrupt", "brusque", "short", "blunt"], antonyms: ["polite", "courteous", "expansive"], difficulty: 2, pos: "adjective", example: "His curt reply made it clear he was angry." },
  { word: "cynical", definition: "Believing that people are motivated by selfishness", simpleDefinition: "Not trusting people — believing everyone is only out for themselves", synonyms: ["distrustful", "sceptical", "pessimistic", "scornful"], antonyms: ["trusting", "optimistic", "idealistic"], difficulty: 3, pos: "adjective", example: "Years of disappointment had made her cynical." },
  { word: "decrepit", definition: "Worn out and ruined by age or neglect", simpleDefinition: "Old, worn out and in very poor condition — falling apart", synonyms: ["dilapidated", "crumbling", "frail", "worn"], antonyms: ["sturdy", "robust", "pristine"], difficulty: 3, pos: "adjective", example: "The decrepit building looked ready to collapse." },
  { word: "deliberate", definition: "Done consciously and intentionally; not accidental", simpleDefinition: "Done on purpose — planned and intentional, not by accident", synonyms: ["intentional", "planned", "calculated", "conscious"], antonyms: ["accidental", "unintentional", "impulsive"], difficulty: 2, pos: "adjective", example: "Her deliberately slow pace was meant to annoy him." },
  { word: "demean", definition: "To treat someone as if they are not worthy of respect", simpleDefinition: "To make someone feel low or unworthy — to humiliate them", synonyms: ["humiliate", "degrade", "belittle", "dishonour"], antonyms: ["respect", "honour", "dignify"], difficulty: 3, pos: "verb", example: "She refused to demean herself by arguing back." },
  { word: "denounce", definition: "To publicly declare something or someone as bad or wrong", simpleDefinition: "To publicly call something out as wrong or wicked", synonyms: ["condemn", "criticise", "accuse", "censure"], antonyms: ["praise", "commend", "endorse"], difficulty: 3, pos: "verb", example: "The leader was denounced as a tyrant." },
  { word: "depict", definition: "To show or represent something in a picture or story", simpleDefinition: "To show or describe something — like in a painting or a story", synonyms: ["portray", "represent", "illustrate", "show"], difficulty: 2, pos: "verb", example: "The painting depicted a scene from ancient Rome." },
  { word: "deprivation", definition: "The lack of something considered necessary for wellbeing", simpleDefinition: "Being without something important for a good life", synonyms: ["hardship", "poverty", "need", "shortage"], antonyms: ["abundance", "plenty", "privilege"], difficulty: 3, pos: "noun", example: "Children in deprivation often struggle at school." },
  { word: "deteriorate", definition: "To become progressively worse in quality or condition", simpleDefinition: "To get worse and worse over time", synonyms: ["worsen", "decline", "degrade", "decay"], antonyms: ["improve", "recover", "flourish"], difficulty: 3, pos: "verb", example: "His health began to deteriorate rapidly." },
  { word: "diffident", definition: "Modest and shy because of a lack of self-confidence", simpleDefinition: "Shy and lacking confidence — unsure of yourself", synonyms: ["shy", "timid", "modest", "hesitant"], antonyms: ["confident", "bold", "assertive"], difficulty: 3, pos: "adjective", example: "Her diffident manner hid great ability." },
  { word: "discern", definition: "To perceive or recognise something clearly", simpleDefinition: "To notice or understand something clearly — to see what others miss", synonyms: ["perceive", "detect", "distinguish", "recognise"], difficulty: 3, pos: "verb", example: "She could discern a pattern in the data." },
  { word: "discreet", definition: "Careful not to attract attention or cause offence", simpleDefinition: "Careful and quiet — keeping things private and not causing trouble", synonyms: ["tactful", "careful", "cautious", "diplomatic"], antonyms: ["reckless", "indiscreet", "tactless"], difficulty: 2, pos: "adjective", example: "He was discreet about what he had seen." },
  { word: "discrepancy", definition: "A difference or inconsistency between things", simpleDefinition: "A difference or mismatch that shouldn't be there", synonyms: ["difference", "inconsistency", "mismatch", "gap"], difficulty: 3, pos: "noun", example: "There was a discrepancy between the two versions of the story." },
  { word: "dispel", definition: "To make a feeling or belief disappear", simpleDefinition: "To get rid of a worry or false belief — to make it disappear", synonyms: ["dismiss", "banish", "eliminate", "scatter"], antonyms: ["create", "foster", "spread"], difficulty: 3, pos: "verb", example: "The truth finally dispelled the rumours." },
  { word: "dissent", definition: "To hold or express a different opinion from others", simpleDefinition: "To disagree with what everyone else thinks or believes", synonyms: ["disagree", "oppose", "object", "protest"], antonyms: ["agree", "conform", "concur"], difficulty: 3, pos: "verb", example: "One judge dissented from the majority decision." },
  { word: "dogmatic", definition: "Asserting opinions as absolute truths without considering others", simpleDefinition: "Rigidly sticking to beliefs — refusing to consider other views", synonyms: ["rigid", "stubborn", "inflexible", "opinionated"], antonyms: ["open-minded", "flexible", "tolerant"], difficulty: 4, pos: "adjective", example: "His dogmatic views made debate impossible." },
  { word: "dupe", definition: "To deceive or trick someone into doing something", simpleDefinition: "To trick someone into believing something false", synonyms: ["deceive", "trick", "fool", "mislead"], antonyms: ["enlighten", "inform"], difficulty: 3, pos: "verb", example: "She was duped into handing over her savings." },
  { word: "elicit", definition: "To draw out a reaction or response from someone", simpleDefinition: "To draw out a response — to make someone react to something", synonyms: ["draw", "extract", "prompt", "provoke"], difficulty: 3, pos: "verb", example: "His speech elicited a strong reaction from the crowd." },
  { word: "eloquence", definition: "Fluent and persuasive use of language", simpleDefinition: "The ability to speak or write in a clear, persuasive way", synonyms: ["fluency", "articulateness", "expressiveness"], difficulty: 3, pos: "noun", example: "Her eloquence as a speaker moved the audience to tears." },
  { word: "elusive", definition: "Difficult to find, catch, or achieve", simpleDefinition: "Hard to catch or pin down — always slipping away", synonyms: ["evasive", "slippery", "fleeting", "mysterious"], antonyms: ["obvious", "clear", "accessible"], difficulty: 3, pos: "adjective", example: "Success had proved elusive throughout his career." },
  { word: "embolden", definition: "To give someone confidence to do something", simpleDefinition: "To give someone the courage to do something brave", synonyms: ["encourage", "inspire", "strengthen", "reassure"], antonyms: ["discourage", "deter", "intimidate"], difficulty: 3, pos: "verb", example: "Her kind words emboldened him to speak up." },
  { word: "empathy", definition: "The ability to understand and share the feelings of another", simpleDefinition: "Understanding and sharing how someone else feels", synonyms: ["compassion", "understanding", "sympathy", "sensitivity"], antonyms: ["indifference", "callousness"], difficulty: 2, pos: "noun", example: "Good teachers have empathy for their students." },
  { word: "enmity", definition: "A state of deep hatred or hostility between people", simpleDefinition: "Deep hatred and hostility between people", synonyms: ["hatred", "hostility", "antagonism", "bitterness"], antonyms: ["friendship", "goodwill", "harmony"], difficulty: 4, pos: "noun", example: "The enmity between the families lasted generations." },
  { word: "equitable", definition: "Fair and impartial; treating everyone equally", simpleDefinition: "Fair to everyone — treating people equally and impartially", synonyms: ["fair", "just", "impartial", "unbiased"], antonyms: ["unfair", "biased", "unjust"], difficulty: 3, pos: "adjective", example: "An equitable solution was found for both sides." },
  { word: "erratic", definition: "Unpredictable or inconsistent in behaviour", simpleDefinition: "Unpredictable — behaving in a way that keeps changing", synonyms: ["unpredictable", "irregular", "inconsistent", "unstable"], antonyms: ["consistent", "regular", "predictable"], difficulty: 3, pos: "adjective", example: "His erratic behaviour worried his friends." },
  { word: "evade", definition: "To escape or avoid something, especially by cunning", simpleDefinition: "To cleverly avoid or escape from something", synonyms: ["avoid", "escape", "dodge", "elude"], antonyms: ["confront", "face", "tackle"], difficulty: 2, pos: "verb", example: "He tried to evade the question with a joke." },
  { word: "exonerate", definition: "To officially declare someone not guilty or not responsible", simpleDefinition: "To officially clear someone of blame — to prove they are innocent", synonyms: ["acquit", "clear", "absolve", "vindicate"], antonyms: ["blame", "convict", "condemn"], difficulty: 4, pos: "verb", example: "New evidence exonerated him of all charges." },
  { word: "exorbitant", definition: "Much greater than is considered fair or reasonable", simpleDefinition: "Way too much — an unreasonably large price or demand", synonyms: ["excessive", "extravagant", "unreasonable", "steep"], antonyms: ["reasonable", "fair", "modest"], difficulty: 3, pos: "adjective", example: "The hotel charged an exorbitant price for breakfast." },
  { word: "exquisite", definition: "Extremely beautiful and delicate", simpleDefinition: "Extremely beautiful — perfect in every fine detail", synonyms: ["beautiful", "delicate", "elegant", "perfect"], antonyms: ["ugly", "coarse", "crude"], difficulty: 3, pos: "adjective", example: "The jeweller crafted an exquisite diamond ring." },
  { word: "fabricate", definition: "To invent false information; or to manufacture something", simpleDefinition: "To make something up — to invent a false story or lie", synonyms: ["invent", "concoct", "devise", "falsify"], antonyms: ["reveal", "expose", "confess"], difficulty: 3, pos: "verb", example: "He had fabricated the entire alibi." },
  { word: "fallible", definition: "Capable of making mistakes; not infallible", simpleDefinition: "Able to make mistakes — not perfect, like all humans", synonyms: ["imperfect", "flawed", "unreliable"], antonyms: ["infallible", "perfect", "reliable"], difficulty: 3, pos: "adjective", example: "Even experts are fallible and make mistakes sometimes." },
  { word: "fastidious", definition: "Very concerned with accuracy and detail; hard to please", simpleDefinition: "Very fussy and careful about details — everything has to be just right", synonyms: ["meticulous", "particular", "fussy", "precise"], antonyms: ["careless", "sloppy", "lax"], difficulty: 4, pos: "adjective", example: "The fastidious chef rejected any ingredient that wasn't perfect." },
  { word: "flippant", definition: "Not showing appropriate seriousness or respect", simpleDefinition: "Not taking something seriously when you should — being disrespectful", synonyms: ["frivolous", "disrespectful", "shallow", "glib"], antonyms: ["serious", "respectful", "sincere"], difficulty: 3, pos: "adjective", example: "His flippant remark was out of place at the funeral." },
  { word: "forbearance", definition: "Patient restraint; tolerance when provoked", simpleDefinition: "Patient self-control — staying calm when you're being provoked", synonyms: ["patience", "tolerance", "restraint", "endurance"], antonyms: ["impatience", "intolerance", "anger"], difficulty: 4, pos: "noun", example: "She showed great forbearance in the face of constant criticism." },
  { word: "forthright", definition: "Direct and outspoken; frank and bold in manner", simpleDefinition: "Honest and direct — saying exactly what you think", synonyms: ["direct", "frank", "candid", "blunt"], antonyms: ["evasive", "indirect", "secretive"], difficulty: 3, pos: "adjective", example: "He was forthright in his criticism of the plan." },
  { word: "fortitude", definition: "Courage and strength in facing pain or adversity", simpleDefinition: "Bravery and strength to face hardship without giving up", synonyms: ["courage", "bravery", "resilience", "endurance"], antonyms: ["cowardice", "weakness", "timidity"], difficulty: 3, pos: "noun", example: "She faced her illness with remarkable fortitude." },
  { word: "gregarious", definition: "Fond of company; sociable and outgoing", simpleDefinition: "Really enjoying being with people — friendly and sociable", synonyms: ["sociable", "outgoing", "friendly", "convivial"], antonyms: ["solitary", "shy", "withdrawn"], difficulty: 3, pos: "adjective", example: "His gregarious personality made him the life of every party." },
  { word: "guile", definition: "Clever but dishonest behaviour used to deceive", simpleDefinition: "Clever trickery — using cunning to deceive people", synonyms: ["cunning", "trickery", "deceit", "craft"], antonyms: ["honesty", "naivety", "sincerity"], difficulty: 3, pos: "noun", example: "She won the argument through guile rather than logic." },
  { word: "hamper", definition: "To hinder or obstruct the progress of something", simpleDefinition: "To get in the way of something — to slow it down or stop it", synonyms: ["hinder", "obstruct", "impede", "restrict"], antonyms: ["assist", "facilitate", "help"], difficulty: 3, pos: "verb", example: "The bad weather hampered the rescue operation." },
  { word: "hubris", definition: "Excessive pride or self-confidence, leading to downfall", simpleDefinition: "Dangerously extreme pride — thinking you can't be beaten", synonyms: ["arrogance", "conceit", "pride", "overconfidence"], antonyms: ["humility", "modesty"], difficulty: 4, pos: "noun", example: "His hubris led him to believe he could never fail." },
  { word: "hypocrisy", definition: "Claiming to have beliefs you don't actually have", simpleDefinition: "Saying one thing but doing another — being two-faced", synonyms: ["deceit", "dishonesty", "insincerity", "pretence"], antonyms: ["sincerity", "honesty", "integrity"], difficulty: 3, pos: "noun", example: "His hypocrisy was clear — he preached kindness but acted cruelly." },
  { word: "impeccable", definition: "In accordance with the highest standards; faultless", simpleDefinition: "Perfectly faultless — without a single thing wrong", synonyms: ["faultless", "perfect", "flawless", "exemplary"], antonyms: ["flawed", "imperfect", "faulty"], difficulty: 3, pos: "adjective", example: "Her impeccable manners impressed everyone at the table." },
  { word: "impede", definition: "To delay or obstruct the progress of something", simpleDefinition: "To get in the way and slow something down — to block it", synonyms: ["hinder", "obstruct", "hamper", "block"], antonyms: ["assist", "facilitate", "accelerate"], difficulty: 3, pos: "verb", example: "The roadworks impeded the flow of traffic." },
  { word: "imperious", definition: "Arrogantly domineering; expecting obedience", simpleDefinition: "Arrogantly bossy — expecting everyone to obey without question", synonyms: ["domineering", "overbearing", "arrogant", "commanding"], antonyms: ["humble", "meek", "submissive"], difficulty: 4, pos: "adjective", example: "She spoke in an imperious tone that allowed no argument." },
  { word: "impudent", definition: "Showing a lack of respect; bold in a rude way", simpleDefinition: "Rude and disrespectful in a bold, cheeky way", synonyms: ["rude", "insolent", "brazen", "disrespectful"], antonyms: ["respectful", "polite", "humble"], difficulty: 3, pos: "adjective", example: "The impudent child answered back at every opportunity." },
  { word: "incorrigible", definition: "Not able to be corrected or reformed", simpleDefinition: "Impossible to change or correct — beyond reform", synonyms: ["hopeless", "persistent", "unruly", "stubborn"], antonyms: ["reformable", "obedient", "cooperative"], difficulty: 4, pos: "adjective", example: "He was an incorrigible liar." },
  { word: "indispensable", definition: "Too important to be without; absolutely essential", simpleDefinition: "So important that you can't manage without it", synonyms: ["essential", "vital", "crucial", "necessary"], antonyms: ["unnecessary", "redundant", "dispensable"], difficulty: 3, pos: "adjective", example: "A good teacher is indispensable to a child's education." },
  { word: "indignation", definition: "Anger caused by something unfair or unjust", simpleDefinition: "Righteous anger at something unfair — being rightly outraged", synonyms: ["outrage", "anger", "fury", "resentment"], antonyms: ["contentment", "acceptance", "calm"], difficulty: 3, pos: "noun", example: "She expressed her indignation at the unjust decision." },
  { word: "inept", definition: "Lacking skill or competence; clumsy", simpleDefinition: "Lacking skill — doing things badly and without competence", synonyms: ["incompetent", "clumsy", "unskilled", "bumbling"], antonyms: ["skilful", "adept", "competent"], difficulty: 2, pos: "adjective", example: "The inept plumber flooded the whole bathroom." },
  { word: "infallible", definition: "Never making mistakes; incapable of being wrong", simpleDefinition: "Never ever wrong — completely reliable and always correct", synonyms: ["perfect", "reliable", "faultless", "accurate"], antonyms: ["fallible", "imperfect", "unreliable"], difficulty: 3, pos: "adjective", example: "No one is infallible — everyone makes mistakes." },
  { word: "ingenuous", definition: "Innocent and unsuspecting; artlessly frank", simpleDefinition: "Innocent and honest — naively trusting and open", synonyms: ["innocent", "naive", "trusting", "frank"], antonyms: ["cunning", "devious", "suspicious"], difficulty: 4, pos: "adjective", example: "Her ingenuous questions revealed she trusted everyone." },
  { word: "innate", definition: "Inborn; existing from birth; natural", simpleDefinition: "Something you're born with — a natural ability or quality", synonyms: ["inborn", "natural", "inherent", "instinctive"], antonyms: ["learned", "acquired", "developed"], difficulty: 3, pos: "adjective", example: "She had an innate talent for music." },
  { word: "irascible", definition: "Easily made angry; quick-tempered", simpleDefinition: "Getting angry very easily — quick to lose your temper", synonyms: ["irritable", "short-tempered", "tetchy", "cantankerous"], antonyms: ["calm", "patient", "placid"], difficulty: 4, pos: "adjective", example: "The irascible teacher shouted at the class daily." },
  { word: "justice", definition: "Fair behaviour and treatment of all people equally", simpleDefinition: "Being fair to everyone — treating people equally and rightly", synonyms: ["fairness", "equity", "righteousness", "impartiality"], antonyms: ["injustice", "unfairness", "bias"], difficulty: 2, pos: "noun", example: "Everyone deserves justice under the law." },
  { word: "judicious", definition: "Having or showing good judgement; sensible and wise", simpleDefinition: "Showing good judgement — making wise and sensible decisions", synonyms: ["wise", "prudent", "sensible", "discerning"], antonyms: ["foolish", "rash", "imprudent"], difficulty: 3, pos: "adjective", example: "A judicious decision was made after careful thought." },
  { word: "lethargy", definition: "A lack of energy and enthusiasm; sluggishness", simpleDefinition: "Feeling very tired and sluggish — no energy at all", synonyms: ["sluggishness", "tiredness", "listlessness", "inertia"], antonyms: ["energy", "vigour", "enthusiasm"], difficulty: 3, pos: "noun", example: "A feeling of lethargy overcame him in the afternoon heat." },
  { word: "listless", definition: "Lacking energy or enthusiasm; sluggish", simpleDefinition: "Without any energy or interest — feeling dull and flat", synonyms: ["lethargic", "languid", "sluggish", "apathetic"], antonyms: ["energetic", "enthusiastic", "lively"], difficulty: 3, pos: "adjective", example: "After the illness, she was listless and pale." },
  { word: "melancholy", definition: "A deep feeling of sadness and gloom", simpleDefinition: "A deep, quiet sadness — a gloomy feeling that won't go away", synonyms: ["sadness", "gloom", "sorrow", "despondency"], antonyms: ["happiness", "joy", "elation"], difficulty: 3, pos: "noun", example: "A sense of melancholy hung over the empty house." },
  { word: "mercy", definition: "Compassion shown towards an offender or enemy", simpleDefinition: "Showing kindness to someone you could punish — being forgiving", synonyms: ["compassion", "forgiveness", "clemency", "leniency"], antonyms: ["cruelty", "harshness", "severity"], difficulty: 2, pos: "noun", example: "The judge showed mercy and reduced the sentence." },
  { word: "methodical", definition: "Done in a well-ordered and systematic way", simpleDefinition: "Carefully organised and step-by-step — working in a neat, orderly way", synonyms: ["systematic", "orderly", "organised", "precise"], antonyms: ["disorganised", "haphazard", "chaotic"], difficulty: 3, pos: "adjective", example: "She took a methodical approach to revision." },
  { word: "mitigate", definition: "To make something less severe or serious", simpleDefinition: "To make something less bad — to reduce the harm or damage", synonyms: ["lessen", "reduce", "soften", "alleviate"], antonyms: ["worsen", "intensify", "aggravate"], difficulty: 4, pos: "verb", example: "Drinking water helps mitigate the effects of dehydration." },
  { word: "modesty", definition: "A humble and moderate view of one's own abilities", simpleDefinition: "Not showing off — being humble about what you can do", synonyms: ["humility", "humbleness", "diffidence", "reserve"], antonyms: ["arrogance", "conceit", "vanity"], difficulty: 2, pos: "noun", example: "She accepted the award with great modesty." },
  { word: "mollify", definition: "To calm someone who is angry or upset", simpleDefinition: "To calm someone down when they are angry — to soothe them", synonyms: ["calm", "soothe", "appease", "placate"], antonyms: ["anger", "agitate", "provoke"], difficulty: 4, pos: "verb", example: "He tried to mollify her with an apology and flowers." },
  { word: "mundane", definition: "Lacking interest or excitement; ordinary and dull", simpleDefinition: "Boring and ordinary — nothing special or exciting about it", synonyms: ["boring", "ordinary", "dull", "routine"], antonyms: ["exciting", "extraordinary", "fascinating"], difficulty: 3, pos: "adjective", example: "He found the mundane tasks of office life mind-numbing." },
  { word: "negligence", definition: "Failure to take proper care over something", simpleDefinition: "Failing to take proper care — being careless in a harmful way", synonyms: ["carelessness", "neglect", "recklessness", "inattention"], antonyms: ["care", "diligence", "attentiveness"], difficulty: 3, pos: "noun", example: "The accident was caused by the driver's negligence." },
  { word: "nobility", definition: "The quality of being noble in character or rank", simpleDefinition: "Having high moral character — or belonging to the noble class", synonyms: ["honour", "dignity", "virtue", "integrity"], antonyms: ["dishonour", "disgrace", "corruption"], difficulty: 3, pos: "noun", example: "He showed great nobility by refusing the reward." },
  { word: "obdurate", definition: "Stubbornly refusing to change one's views or actions", simpleDefinition: "Completely set in your ways — refusing to budge or change", synonyms: ["stubborn", "obstinate", "unyielding", "inflexible"], antonyms: ["flexible", "yielding", "compliant"], difficulty: 4, pos: "adjective", example: "He remained obdurate despite all appeals." },
  { word: "obliterate", definition: "To destroy something so completely it no longer exists", simpleDefinition: "To destroy completely — wiping something out so nothing is left", synonyms: ["destroy", "erase", "annihilate", "eliminate"], antonyms: ["create", "build", "preserve"], difficulty: 3, pos: "verb", example: "The fire obliterated every trace of the building." },
  { word: "obsequious", definition: "Excessively eager to please or serve someone", simpleDefinition: "Over-the-top flattering — creepily eager to please people in charge", synonyms: ["fawning", "servile", "submissive", "sycophantic"], antonyms: ["assertive", "independent", "defiant"], difficulty: 4, pos: "adjective", example: "The obsequious assistant agreed with everything the boss said." },
  { word: "ostentatious", definition: "Showy and designed to impress or attract attention", simpleDefinition: "Showing off wealth or importance — trying to impress everyone", synonyms: ["showy", "flashy", "pretentious", "flamboyant"], antonyms: ["modest", "understated", "humble"], difficulty: 4, pos: "adjective", example: "The ostentatious mansion had gold taps in every room." },
  { word: "ostracise", definition: "To exclude someone from a group or society", simpleDefinition: "To shut someone out and exclude them from the group", synonyms: ["exclude", "shun", "isolate", "banish"], antonyms: ["include", "welcome", "accept"], difficulty: 4, pos: "verb", example: "After the argument she was ostracised by her classmates." },
  { word: "overbearing", definition: "Unpleasantly dominant and controlling", simpleDefinition: "Bossy and controlling — always trying to be in charge of everyone", synonyms: ["domineering", "controlling", "bullying", "oppressive"], antonyms: ["gentle", "submissive", "tolerant"], difficulty: 3, pos: "adjective", example: "The overbearing manager micromanaged every tiny task." },
  { word: "parsimonious", definition: "Extremely unwilling to spend money; very stingy", simpleDefinition: "Very unwilling to spend money — extremely tight with cash", synonyms: ["mean", "miserly", "tight-fisted", "stingy"], antonyms: ["generous", "lavish", "charitable"], difficulty: 4, pos: "adjective", example: "The parsimonious owner refused to fix the broken heater." },
  { word: "penitent", definition: "Feeling or showing sorrow for wrongdoing", simpleDefinition: "Feeling genuinely sorry for something you did wrong", synonyms: ["remorseful", "repentant", "contrite", "regretful"], antonyms: ["unrepentant", "shameless", "defiant"], difficulty: 3, pos: "adjective", example: "He was penitent and promised to make amends." },
  { word: "perceptive", definition: "Having good insight and understanding; observant", simpleDefinition: "Good at noticing things — understanding situations quickly and deeply", synonyms: ["observant", "shrewd", "astute", "insightful"], antonyms: ["oblivious", "naive", "unobservant"], difficulty: 3, pos: "adjective", example: "Her perceptive remarks got to the heart of the problem." },
  { word: "perseverance", definition: "Continued effort despite difficulty or delay", simpleDefinition: "Keeping going even when it's hard — never giving up", synonyms: ["persistence", "determination", "tenacity", "endurance"], antonyms: ["apathy", "weakness", "surrender"], difficulty: 3, pos: "noun", example: "Her perseverance eventually paid off." },
  { word: "pertinent", definition: "Relevant and appropriate to a particular matter", simpleDefinition: "Directly relevant and to the point — exactly what's needed", synonyms: ["relevant", "applicable", "appropriate", "related"], antonyms: ["irrelevant", "unrelated", "inappropriate"], difficulty: 3, pos: "adjective", example: "She raised a pertinent question about the budget." },
  { word: "philanthropy", definition: "Generous donation of time or money to help others", simpleDefinition: "Generous giving to help others — using wealth to do good", synonyms: ["charity", "generosity", "benevolence", "altruism"], antonyms: ["selfishness", "greed", "meanness"], difficulty: 3, pos: "noun", example: "Her philanthropy transformed the local school." },
  { word: "poignant", definition: "Evoking a keen sense of sadness or regret", simpleDefinition: "Moving in a sad way — touching your heart with sadness", synonyms: ["moving", "touching", "sad", "emotional"], antonyms: ["unfeeling", "cold", "trivial"], difficulty: 3, pos: "adjective", example: "The film's ending was deeply poignant." },
  { word: "prejudice", definition: "An unfair opinion about a group not based on reason", simpleDefinition: "Unfairly judging someone before knowing them — based on nothing real", synonyms: ["bias", "discrimination", "bigotry", "intolerance"], antonyms: ["fairness", "impartiality", "tolerance"], difficulty: 2, pos: "noun", example: "Prejudice of any kind has no place in a fair society." },
  { word: "presumptuous", definition: "Behaving as if you have more rights than you do", simpleDefinition: "Being too confident and overstepping your place — too cheeky", synonyms: ["arrogant", "bold", "impertinent", "forward"], antonyms: ["modest", "deferential", "respectful"], difficulty: 3, pos: "adjective", example: "It was presumptuous to assume she would say yes." },
  { word: "proclaim", definition: "To declare something publicly and officially", simpleDefinition: "To announce something loudly and officially — for everyone to hear", synonyms: ["declare", "announce", "pronounce", "broadcast"], antonyms: ["conceal", "suppress", "whisper"], difficulty: 2, pos: "verb", example: "The king proclaimed a day of celebration." },
  { word: "punctual", definition: "Arriving or doing something at the expected time", simpleDefinition: "Always on time — never late for anything", synonyms: ["prompt", "timely", "reliable", "precise"], antonyms: ["late", "tardy", "delayed"], difficulty: 2, pos: "adjective", example: "She was always punctual, never keeping anyone waiting." },
  { word: "rebuke", definition: "To express sharp disapproval or criticism of someone", simpleDefinition: "To tell someone off sharply — criticising them for something wrong", synonyms: ["scold", "reprimand", "criticise", "chide"], antonyms: ["praise", "commend", "approve"], difficulty: 3, pos: "verb", example: "The referee rebuked the player for time-wasting." },
  { word: "rectitude", definition: "Morally correct behaviour; righteousness", simpleDefinition: "Being morally correct and honest in everything you do", synonyms: ["integrity", "honesty", "righteousness", "virtue"], antonyms: ["dishonesty", "corruption", "immorality"], difficulty: 4, pos: "noun", example: "He was known throughout the village for his rectitude." },
  { word: "relinquish", definition: "To give up something you have or want", simpleDefinition: "To give something up — letting go of something you had", synonyms: ["surrender", "abandon", "yield", "forsake"], antonyms: ["keep", "retain", "claim"], difficulty: 3, pos: "verb", example: "She reluctantly relinquished her claim to the prize." },
  { word: "renounce", definition: "To formally give up a right, claim, or belief", simpleDefinition: "To formally give up something — announcing you no longer want it", synonyms: ["abandon", "surrender", "relinquish", "reject"], antonyms: ["claim", "embrace", "uphold"], difficulty: 3, pos: "verb", example: "He renounced his title and walked away." },
  { word: "repentance", definition: "Sincere regret or remorse for past wrongdoing", simpleDefinition: "Feeling truly sorry for something wrong you did", synonyms: ["remorse", "regret", "contrition", "guilt"], antonyms: ["defiance", "shamelessness", "pride"], difficulty: 3, pos: "noun", example: "She showed genuine repentance for her actions." },
  { word: "reticent", definition: "Not revealing one's thoughts or feelings readily", simpleDefinition: "Quiet and reluctant to share feelings — keeping things to yourself", synonyms: ["reserved", "quiet", "withdrawn", "guarded"], antonyms: ["outspoken", "forthright", "talkative"], difficulty: 3, pos: "adjective", example: "He was reticent about his past." },
  { word: "restrain", definition: "To hold back or keep under control", simpleDefinition: "To hold something or someone back — to stop them going too far", synonyms: ["control", "limit", "curb", "suppress"], antonyms: ["release", "free", "encourage"], difficulty: 2, pos: "verb", example: "She had to restrain herself from saying what she really thought." },
  { word: "rigorous", definition: "Extremely thorough and careful; strict", simpleDefinition: "Very thorough and strict — leaving no room for error", synonyms: ["thorough", "strict", "precise", "demanding"], antonyms: ["lax", "sloppy", "lenient"], difficulty: 3, pos: "adjective", example: "The experiment required rigorous testing." },
  { word: "rivalry", definition: "Competition for the same objective or superiority", simpleDefinition: "Competing against someone for the same thing — a contest", synonyms: ["competition", "contest", "opposition", "conflict"], antonyms: ["cooperation", "alliance", "harmony"], difficulty: 2, pos: "noun", example: "The rivalry between the two schools was fierce." },
  { word: "sanctimonious", definition: "Making a show of being morally superior to others", simpleDefinition: "Acting like you're morally better than everyone else — self-righteous", synonyms: ["self-righteous", "pious", "pompous", "smug"], antonyms: ["humble", "modest", "sincere"], difficulty: 4, pos: "adjective", example: "His sanctimonious lectures about honesty grew tiresome." },
  { word: "scrutinise", definition: "To examine or inspect something very closely", simpleDefinition: "To examine something very carefully — looking at every detail", synonyms: ["examine", "inspect", "analyse", "study"], antonyms: ["overlook", "ignore", "glance"], difficulty: 3, pos: "verb", example: "She scrutinised every line of the contract." },
  { word: "scrupulous", definition: "Having a strong sense of what is right; very careful", simpleDefinition: "Very careful and honest — making sure everything is done properly", synonyms: ["careful", "meticulous", "principled", "conscientious"], antonyms: ["careless", "dishonest", "unscrupulous"], difficulty: 3, pos: "adjective", example: "She was scrupulous about keeping accurate records." },
  { word: "sinister", definition: "Suggesting evil or harm; threatening", simpleDefinition: "Suggesting something evil or threatening — giving a bad feeling", synonyms: ["threatening", "menacing", "evil", "ominous"], antonyms: ["harmless", "benign", "innocent"], difficulty: 2, pos: "adjective", example: "The stranger gave a sinister smile." },
  { word: "spontaneous", definition: "Done naturally without planning; impulsive", simpleDefinition: "Happening naturally without any planning — sudden and unplanned", synonyms: ["impulsive", "natural", "unplanned", "instinctive"], antonyms: ["planned", "deliberate", "calculated"], difficulty: 3, pos: "adjective", example: "The crowd broke into spontaneous applause." },
  { word: "steadfast", definition: "Resolutely firm and unwavering; loyal and committed", simpleDefinition: "Firm and loyal — not changing no matter what happens", synonyms: ["determined", "resolute", "loyal", "unwavering"], antonyms: ["wavering", "unreliable", "fickle"], difficulty: 2, pos: "adjective", example: "She remained steadfast in her support for her friend." },
  { word: "stifle", definition: "To make something difficult or impossible to express", simpleDefinition: "To hold something back or block it — to suppress it", synonyms: ["suppress", "smother", "restrain", "prevent"], antonyms: ["encourage", "promote", "release"], difficulty: 3, pos: "verb", example: "She stifled a yawn during the dull speech." },
  { word: "stringent", definition: "Very strict and precise; leaving no room for error", simpleDefinition: "Very strict and tight — rules with no flexibility at all", synonyms: ["strict", "severe", "harsh", "demanding"], antonyms: ["lenient", "relaxed", "flexible"], difficulty: 3, pos: "adjective", example: "The factory operated under stringent safety rules." },
  { word: "subjugate", definition: "To bring under complete control or domination", simpleDefinition: "To completely overpower and control someone — to dominate them", synonyms: ["dominate", "oppress", "conquer", "control"], antonyms: ["free", "liberate", "empower"], difficulty: 4, pos: "verb", example: "The invaders attempted to subjugate the native people." },
  { word: "supercilious", definition: "Believing oneself superior and showing it through manner", simpleDefinition: "Acting like you're far too important and superior to bother with others", synonyms: ["arrogant", "condescending", "haughty", "disdainful"], antonyms: ["humble", "modest", "respectful"], difficulty: 4, pos: "adjective", example: "The supercilious waiter barely looked at the customers." },
  { word: "surmount", definition: "To overcome a difficulty or obstacle", simpleDefinition: "To overcome a problem or challenge — to get past it", synonyms: ["overcome", "conquer", "defeat", "master"], antonyms: ["fail", "surrender", "capitulate"], difficulty: 3, pos: "verb", example: "She surmounted every obstacle to reach the top." },
  { word: "susceptible", definition: "Likely to be influenced or harmed by something", simpleDefinition: "Easily affected or harmed — not able to resist something", synonyms: ["vulnerable", "sensitive", "prone", "weak"], antonyms: ["resistant", "immune", "strong"], difficulty: 3, pos: "adjective", example: "Young children are susceptible to colds." },
  { word: "taciturn", definition: "Habitually saying little; not talkative", simpleDefinition: "Very quiet and saying very little — a person of few words", synonyms: ["quiet", "silent", "reserved", "withdrawn"], antonyms: ["talkative", "outgoing", "verbose"], difficulty: 4, pos: "adjective", example: "The taciturn detective gave nothing away." },
  { word: "tarnish", definition: "To damage or spoil the reputation of someone or something", simpleDefinition: "To damage someone's good name — to make them look bad", synonyms: ["damage", "soil", "blemish", "disgrace"], antonyms: ["improve", "enhance", "honour"], difficulty: 3, pos: "verb", example: "The scandal tarnished his once-brilliant reputation." },
  { word: "tenacity", definition: "The quality of being determined and persistent", simpleDefinition: "Stubborn determination — refusing to give up no matter what", synonyms: ["persistence", "determination", "resolve", "grit"], antonyms: ["weakness", "submission", "apathy"], difficulty: 3, pos: "noun", example: "She succeeded through sheer tenacity." },
  { word: "tenuous", definition: "Weak or slight; not firmly established", simpleDefinition: "Very weak or thin — barely holding together", synonyms: ["weak", "slight", "fragile", "flimsy"], antonyms: ["strong", "solid", "firm"], difficulty: 3, pos: "adjective", example: "His argument rested on a tenuous assumption." },
  { word: "timorous", definition: "Easily frightened; lacking confidence", simpleDefinition: "Easily scared and lacking confidence — nervous and afraid", synonyms: ["timid", "fearful", "shy", "nervous"], antonyms: ["bold", "confident", "courageous"], difficulty: 3, pos: "adjective", example: "The timorous child refused to try anything new." },
  { word: "tractable", definition: "Easy to manage or deal with; obedient", simpleDefinition: "Easy to manage and control — willing to cooperate", synonyms: ["manageable", "obedient", "cooperative", "compliant"], antonyms: ["obstinate", "unruly", "defiant"], difficulty: 4, pos: "adjective", example: "A tractable horse is ideal for a beginner rider." },
  { word: "trepidation", definition: "A feeling of fear or worry about something in the future", simpleDefinition: "A nervous, worried feeling about something that's coming", synonyms: ["fear", "anxiety", "dread", "apprehension"], antonyms: ["confidence", "calm", "eagerness"], difficulty: 3, pos: "noun", example: "She approached the exam with trepidation." },
  { word: "truculent", definition: "Quick to argue or fight; aggressively defiant", simpleDefinition: "Ready to pick a fight — aggressively argumentative", synonyms: ["aggressive", "belligerent", "defiant", "quarrelsome"], antonyms: ["peaceful", "cooperative", "gentle"], difficulty: 4, pos: "adjective", example: "The truculent teenager refused every request." },
  { word: "undermine", definition: "To weaken or damage something gradually and subtly", simpleDefinition: "To quietly weaken something — chipping away at it bit by bit", synonyms: ["weaken", "damage", "erode", "sabotage"], antonyms: ["strengthen", "support", "reinforce"], difficulty: 3, pos: "verb", example: "Constant criticism undermined her confidence." },
  { word: "unscrupulous", definition: "Having no moral principles; not honest or fair", simpleDefinition: "Dishonest and without any moral principles — willing to cheat", synonyms: ["dishonest", "corrupt", "immoral", "devious"], antonyms: ["honest", "ethical", "principled"], difficulty: 3, pos: "adjective", example: "The unscrupulous trader sold faulty products." },
  { word: "vacuous", definition: "Lacking thought or intelligence; empty-minded", simpleDefinition: "Empty-headed — showing no intelligent thought at all", synonyms: ["empty", "mindless", "shallow", "vapid"], antonyms: ["intelligent", "thoughtful", "profound"], difficulty: 4, pos: "adjective", example: "His vacuous grin showed he hadn't understood a word." },
  { word: "vanity", definition: "Excessive pride in one's appearance or achievements", simpleDefinition: "Being too proud of how you look — obsessing over your appearance", synonyms: ["conceit", "pride", "arrogance", "narcissism"], antonyms: ["humility", "modesty", "selflessness"], difficulty: 2, pos: "noun", example: "His vanity meant he spent an hour in front of the mirror." },
  { word: "vanquish", definition: "To defeat someone completely in a contest or battle", simpleDefinition: "To defeat someone completely — to conquer them totally", synonyms: ["defeat", "conquer", "overcome", "crush"], antonyms: ["lose", "surrender", "capitulate"], difficulty: 3, pos: "verb", example: "The hero vanquished the dragon after a long battle." },
  { word: "vehement", definition: "Showing strong feeling; forceful and passionate", simpleDefinition: "Very passionate and forceful — showing strong, intense feelings", synonyms: ["passionate", "fierce", "forceful", "intense"], antonyms: ["mild", "calm", "indifferent"], difficulty: 3, pos: "adjective", example: "She made a vehement argument for changing the rules." },
  { word: "verbose", definition: "Using more words than necessary; wordy", simpleDefinition: "Using far too many words — saying in ten words what you could say in two", synonyms: ["wordy", "long-winded", "repetitive", "rambling"], antonyms: ["concise", "brief", "succinct"], difficulty: 3, pos: "adjective", example: "The verbose report could have been half the length." },
  { word: "vindicate", definition: "To clear someone of blame or show they were right", simpleDefinition: "To prove someone was right or clear them of blame", synonyms: ["clear", "exonerate", "justify", "uphold"], antonyms: ["blame", "condemn", "incriminate"], difficulty: 3, pos: "verb", example: "The new evidence vindicated her completely." },
  { word: "vindictive", definition: "Deliberately seeking to harm or punish someone", simpleDefinition: "Deliberately wanting to harm someone who upset you — spiteful", synonyms: ["spiteful", "vengeful", "malicious", "bitter"], antonyms: ["forgiving", "merciful", "kind"], difficulty: 3, pos: "adjective", example: "Her vindictive behaviour towards him went on for years." },
  { word: "vivacious", definition: "Attractively lively and animated", simpleDefinition: "Full of life and energy — lively and fun to be around", synonyms: ["lively", "animated", "spirited", "vibrant"], antonyms: ["dull", "listless", "subdued"], difficulty: 3, pos: "adjective", example: "Her vivacious personality lit up every room." },
  { word: "whimsical", definition: "Playfully quaint or fanciful; unusual in a charming way", simpleDefinition: "Charmingly odd and playful — imaginative in an unusual way", synonyms: ["fanciful", "playful", "quirky", "imaginative"], antonyms: ["serious", "practical", "mundane"], difficulty: 3, pos: "adjective", example: "The book was filled with whimsical illustrations." },
  { word: "zeal", definition: "Great energy or enthusiasm in pursuing a cause", simpleDefinition: "Strong enthusiasm and energy for something you believe in", synonyms: ["enthusiasm", "passion", "eagerness", "fervour"], antonyms: ["apathy", "indifference", "reluctance"], difficulty: 2, pos: "noun", example: "She worked with great zeal to help the local community." },
  { word: "abhorrent", definition: "Inspiring disgust and moral revulsion", simpleDefinition: "Completely disgusting and morally wrong — making you feel sick", synonyms: ["repulsive", "revolting", "loathsome", "despicable"], antonyms: ["admirable", "appealing", "pleasant"], difficulty: 3, pos: "adjective", example: "The cruelty shown to the prisoners was abhorrent." },
  { word: "abominable", definition: "Causing moral revulsion; thoroughly detestable", simpleDefinition: "Truly terrible and disgusting — as bad as something can be", synonyms: ["dreadful", "appalling", "atrocious", "revolting"], antonyms: ["admirable", "wonderful", "excellent"], difficulty: 3, pos: "adjective", example: "The villain's abominable behaviour shocked everyone." },
  { word: "acerbic", definition: "Sharp and direct in speech or manner; biting", simpleDefinition: "Sharply sarcastic and cutting — words that sting like acid", synonyms: ["sharp", "biting", "cutting", "caustic"], antonyms: ["gentle", "mild", "kind"], difficulty: 4, pos: "adjective", example: "Her acerbic wit left the audience speechless." },
  { word: "alacrity", definition: "Brisk and cheerful readiness to do something", simpleDefinition: "Enthusiastic eagerness — jumping at the chance to do something", synonyms: ["eagerness", "enthusiasm", "willingness", "readiness"], antonyms: ["reluctance", "unwillingness", "hesitation"], difficulty: 4, pos: "noun", example: "She accepted the challenge with alacrity." },
  { word: "aloof", definition: "Not friendly or forthcoming; cool and distant", simpleDefinition: "Distant and unfriendly — keeping yourself apart from others", synonyms: ["distant", "detached", "reserved", "cold"], antonyms: ["friendly", "warm", "sociable"], difficulty: 3, pos: "adjective", example: "He remained aloof from the rest of the group." },
  { word: "altercation", definition: "A noisy argument or confrontation", simpleDefinition: "A heated, noisy argument — a loud falling-out", synonyms: ["argument", "dispute", "quarrel", "confrontation"], antonyms: ["agreement", "harmony", "peace"], difficulty: 3, pos: "noun", example: "The altercation between the neighbours woke the street." },
  { word: "ambivalence", definition: "Having mixed or contradictory feelings about something", simpleDefinition: "Not being sure how you feel — pulled in two directions at once", synonyms: ["uncertainty", "indecision", "doubt", "hesitation"], antonyms: ["certainty", "conviction", "decisiveness"], difficulty: 4, pos: "noun", example: "She felt ambivalence about leaving her old school." },
  { word: "anarchist", definition: "A person who rejects authority and organised government", simpleDefinition: "Someone who believes there should be no rules or government", synonyms: ["rebel", "revolutionary", "insurgent"], antonyms: ["conformist", "loyalist", "supporter"], difficulty: 4, pos: "noun", example: "The anarchist refused to follow any rules he hadn't chosen himself." },
  { word: "antipathy", definition: "A deep-seated feeling of dislike or aversion", simpleDefinition: "A strong, deep dislike of someone or something", synonyms: ["dislike", "hostility", "aversion", "hatred"], antonyms: ["affection", "fondness", "sympathy"], difficulty: 4, pos: "noun", example: "There was clear antipathy between the two rivals." },
  { word: "ardour", definition: "Enthusiasm or passion; great zeal", simpleDefinition: "Intense passion and enthusiasm — burning with desire to do something", synonyms: ["passion", "enthusiasm", "fervour", "zeal"], antonyms: ["indifference", "apathy", "coolness"], difficulty: 3, pos: "noun", example: "She pursued her ambitions with great ardour." },
  { word: "assuage", definition: "To make an unpleasant feeling less intense", simpleDefinition: "To ease or calm a strong feeling — to make it less painful", synonyms: ["soothe", "ease", "relieve", "alleviate"], antonyms: ["worsen", "intensify", "aggravate"], difficulty: 4, pos: "verb", example: "Nothing could assuage his grief over the loss." },
  { word: "auspicious", definition: "Giving a promising outlook for the future; favourable", simpleDefinition: "Showing signs of future success — a promising start", synonyms: ["promising", "favourable", "hopeful", "encouraging"], antonyms: ["ominous", "inauspicious", "unpromising"], difficulty: 4, pos: "adjective", example: "The sunshine on the day of the match felt auspicious." },
  { word: "austerity", definition: "Sternness or severity of manner; difficult economic conditions", simpleDefinition: "Strictness and plainness — or very difficult, tough conditions", synonyms: ["severity", "strictness", "harshness", "frugality"], antonyms: ["luxury", "indulgence", "comfort"], difficulty: 4, pos: "noun", example: "The country endured years of austerity after the war." },
  { word: "autonomous", definition: "Acting independently; having self-government", simpleDefinition: "Independent and self-governing — able to make your own decisions", synonyms: ["independent", "self-governing", "free", "sovereign"], antonyms: ["dependent", "controlled", "subservient"], difficulty: 4, pos: "adjective", example: "The region voted to become autonomous from the central government." },
  { word: "barren", definition: "Too poor to produce vegetation; bleak and lifeless", simpleDefinition: "Bare and lifeless — nothing grows there", synonyms: ["bare", "desolate", "empty", "infertile"], antonyms: ["fertile", "lush", "abundant"], difficulty: 2, pos: "adjective", example: "The barren landscape stretched for miles without a tree." },
  { word: "bellicose", definition: "Eager to fight or argue; warlike", simpleDefinition: "Aggressive and eager for a fight — always looking for war or conflict", synonyms: ["aggressive", "warlike", "combative", "belligerent"], antonyms: ["peaceful", "gentle", "diplomatic"], difficulty: 4, pos: "adjective", example: "The bellicose general was always pushing for battle." },
  { word: "bereft", definition: "Lacking something or feeling a great sense of loss", simpleDefinition: "Feeling completely empty — devastated by the loss of something", synonyms: ["deprived", "robbed", "devoid", "desolate"], antonyms: ["abundant", "full", "enriched"], difficulty: 3, pos: "adjective", example: "She was bereft after her closest friend moved away." },
  { word: "boastful", definition: "Showing excessive pride in your own achievements", simpleDefinition: "Always showing off and bragging about yourself", synonyms: ["arrogant", "conceited", "bragging", "vain"], antonyms: ["modest", "humble", "self-deprecating"], difficulty: 2, pos: "adjective", example: "His boastful talk annoyed everyone in the room." },
  { word: "callow", definition: "Inexperienced and immature", simpleDefinition: "Young, inexperienced and naive — not yet grown up", synonyms: ["immature", "naive", "inexperienced", "green"], antonyms: ["experienced", "mature", "seasoned"], difficulty: 4, pos: "adjective", example: "The callow young reporter made several obvious mistakes." },
  { word: "camaraderie", definition: "Mutual trust and friendship among people", simpleDefinition: "A warm feeling of friendship and loyalty between a group", synonyms: ["friendship", "fellowship", "solidarity", "bonding"], antonyms: ["hostility", "rivalry", "animosity"], difficulty: 4, pos: "noun", example: "There was great camaraderie among the members of the team." },
  { word: "candour", definition: "The quality of being open and honest in expression", simpleDefinition: "Honest and direct — saying what you really think without hiding it", synonyms: ["honesty", "frankness", "openness", "sincerity"], antonyms: ["deceit", "dishonesty", "evasiveness"], difficulty: 3, pos: "noun", example: "I appreciated her candour in telling me the truth." },
  { word: "capricious", definition: "Given to sudden and unpredictable changes of mood", simpleDefinition: "Unpredictable and changeable — you never know what mood they'll be in", synonyms: ["unpredictable", "fickle", "impulsive", "erratic"], antonyms: ["consistent", "predictable", "steady"], difficulty: 4, pos: "adjective", example: "The capricious weather ruined the picnic plans." },
  { word: "cathartic", definition: "Providing psychological relief through emotional release", simpleDefinition: "Helping you feel better by getting emotions out — like a good cry", synonyms: ["cleansing", "purging", "releasing", "therapeutic"], antonyms: ["suppressive", "repressive", "stifling"], difficulty: 4, pos: "adjective", example: "She found the long walk cathartic after the stressful week." },
  { word: "clamour", definition: "A loud, confused noise; an urgent demand", simpleDefinition: "A loud uproar — lots of people shouting at once", synonyms: ["uproar", "noise", "din", "outcry"], antonyms: ["silence", "quiet", "calm"], difficulty: 3, pos: "noun", example: "There was a great clamour from the crowd when the result was announced." },
  { word: "coercion", definition: "Persuading someone to do something by using force or threats", simpleDefinition: "Forcing someone to do something using threats or pressure", synonyms: ["force", "compulsion", "pressure", "intimidation"], antonyms: ["persuasion", "freedom", "choice"], difficulty: 4, pos: "noun", example: "He signed the contract under coercion and later challenged it." },
  { word: "complacency", definition: "Self-satisfaction without awareness of possible dangers", simpleDefinition: "Being too satisfied with yourself — not noticing things going wrong", synonyms: ["smugness", "self-satisfaction", "indifference", "carelessness"], antonyms: ["vigilance", "alertness", "concern"], difficulty: 4, pos: "noun", example: "Complacency after their early success cost them the championship." },
  { word: "complicity", definition: "The state of being involved in wrongdoing", simpleDefinition: "Being involved in something bad — helping someone do wrong", synonyms: ["involvement", "participation", "collusion", "guilt"], antonyms: ["innocence", "ignorance", "opposition"], difficulty: 4, pos: "noun", example: "Her silence was seen as complicity in the deception." },
  { word: "condescension", definition: "Behaving as if one is superior to others", simpleDefinition: "Acting like you're better than everyone else — talking down to people", synonyms: ["patronising", "arrogance", "superiority", "disdain"], antonyms: ["respect", "humility", "deference"], difficulty: 4, pos: "noun", example: "His condescension towards the younger students was obvious." },
  { word: "covert", definition: "Done or kept in secret; hidden", simpleDefinition: "Secret and hidden — done without anyone knowing", synonyms: ["secret", "hidden", "undercover", "clandestine"], antonyms: ["open", "overt", "public"], difficulty: 3, pos: "adjective", example: "The spy carried out a covert mission in enemy territory." },
  { word: "covet", definition: "To yearn to possess something belonging to another", simpleDefinition: "To desperately want something that belongs to someone else", synonyms: ["envy", "desire", "crave", "begrudge"], antonyms: ["disdain", "reject", "despise"], difficulty: 3, pos: "verb", example: "He coveted his neighbour's success." },
  { word: "crestfallen", definition: "Sad and disappointed, especially after a failure", simpleDefinition: "Utterly deflated and disappointed — feeling crushed", synonyms: ["dejected", "downhearted", "despondent", "crushed"], antonyms: ["elated", "overjoyed", "triumphant"], difficulty: 3, pos: "adjective", example: "She was crestfallen when she missed the final." },
  { word: "culpable", definition: "Deserving blame for a fault or wrongdoing", simpleDefinition: "Responsible for something bad and deserving blame for it", synonyms: ["blameworthy", "guilty", "responsible", "liable"], antonyms: ["innocent", "blameless", "guiltless"], difficulty: 4, pos: "adjective", example: "The manager was found culpable for the safety failures." },
  { word: "decadent", definition: "Characterised by luxury and moral decay", simpleDefinition: "Living in excessive luxury — indulging every desire without restraint", synonyms: ["corrupt", "self-indulgent", "dissolute", "degenerate"], antonyms: ["restrained", "austere", "wholesome"], difficulty: 4, pos: "adjective", example: "The Roman empire became increasingly decadent in its later years." },
  { word: "decorum", definition: "Behaviour that is polite and socially appropriate", simpleDefinition: "Proper, dignified behaviour — acting appropriately in a situation", synonyms: ["propriety", "dignity", "decency", "etiquette"], antonyms: ["impropriety", "rudeness", "vulgarity"], difficulty: 4, pos: "noun", example: "The ceremony was conducted with great decorum." },
  { word: "defiance", definition: "Open resistance against authority or opposition", simpleDefinition: "Standing up against authority — boldly refusing to obey", synonyms: ["resistance", "rebellion", "disobedience", "opposition"], antonyms: ["obedience", "compliance", "submission"], difficulty: 3, pos: "noun", example: "She crossed her arms in open defiance of the teacher's instructions." },
  { word: "demeanour", definition: "The way a person behaves or appears; manner", simpleDefinition: "The way you carry yourself and behave — your manner and attitude", synonyms: ["manner", "conduct", "bearing", "attitude"], difficulty: 3, pos: "noun", example: "Despite the chaos around him, his demeanour remained calm." },
  { word: "depraved", definition: "Morally corrupt; having very low moral standards", simpleDefinition: "Deeply immoral — enjoying evil or disgusting things", synonyms: ["corrupt", "immoral", "wicked", "degenerate"], antonyms: ["virtuous", "moral", "upright"], difficulty: 4, pos: "adjective", example: "The depraved villain showed no remorse for his crimes." },
  { word: "depravity", definition: "Moral corruption; wickedness", simpleDefinition: "Deep moral corruption — total wickedness", synonyms: ["wickedness", "corruption", "immorality", "vice"], antonyms: ["virtue", "morality", "righteousness"], difficulty: 4, pos: "noun", example: "The depravity of the tyrant's rule shocked the world." },
  { word: "derelict", definition: "In poor condition through neglect; abandoned", simpleDefinition: "Left to fall apart — abandoned and in very poor condition", synonyms: ["abandoned", "dilapidated", "neglected", "rundown"], antonyms: ["maintained", "intact", "pristine"], difficulty: 3, pos: "adjective", example: "The derelict factory had been empty for decades." },
  { word: "deride", definition: "To express contempt for; to mock", simpleDefinition: "To laugh at or mock someone in a cruel way", synonyms: ["mock", "scoff", "ridicule", "jeer"], antonyms: ["praise", "admire", "respect"], difficulty: 3, pos: "verb", example: "The critics derided his performance as amateurish." },
  { word: "derision", definition: "Contemptuous mockery or ridicule", simpleDefinition: "Cruel, mocking laughter — treating someone as a joke", synonyms: ["mockery", "scorn", "ridicule", "contempt"], antonyms: ["admiration", "respect", "praise"], difficulty: 3, pos: "noun", example: "His suggestion was met with derision from the committee." },
  { word: "desist", definition: "To stop doing something; to cease an activity", simpleDefinition: "To stop doing something — especially after being told to", synonyms: ["stop", "cease", "halt", "refrain"], antonyms: ["continue", "persist", "carry on"], difficulty: 3, pos: "verb", example: "The judge ordered him to desist from contacting his neighbour." },
  { word: "despot", definition: "A ruler who holds absolute power, often cruelly", simpleDefinition: "A cruel ruler with total power — a tyrant", synonyms: ["tyrant", "dictator", "autocrat", "oppressor"], antonyms: ["democrat", "servant", "liberator"], difficulty: 3, pos: "noun", example: "The despot ruled his country through fear and intimidation." },
  { word: "diatribe", definition: "A forceful and bitter verbal attack against someone", simpleDefinition: "A long, angry rant criticising something or someone", synonyms: ["tirade", "rant", "attack", "harangue"], antonyms: ["praise", "compliment", "eulogy"], difficulty: 4, pos: "noun", example: "He launched into a diatribe against the government's policies." },
  { word: "diligence", definition: "Careful and persistent work or effort", simpleDefinition: "Working hard and carefully — not giving up or cutting corners", synonyms: ["effort", "thoroughness", "persistence", "dedication"], antonyms: ["laziness", "negligence", "carelessness"], difficulty: 3, pos: "noun", example: "Her diligence in revision paid off on exam day." },
  { word: "discordant", definition: "Not in agreement; harsh and unpleasant in sound", simpleDefinition: "Not fitting together — clashing and causing disagreement", synonyms: ["clashing", "conflicting", "jarring", "dissonant"], antonyms: ["harmonious", "agreeable", "consistent"], difficulty: 4, pos: "adjective", example: "The discordant notes from the choir made everyone wince." },
  { word: "disdainful", definition: "Showing strong dislike and contempt", simpleDefinition: "Looking down on something with contempt — thinking it beneath you", synonyms: ["contemptuous", "scornful", "dismissive", "haughty"], antonyms: ["respectful", "admiring", "appreciative"], difficulty: 3, pos: "adjective", example: "She gave a disdainful glance at his shabby coat." },
  { word: "dissipate", definition: "To disperse; to waste or squander", simpleDefinition: "To scatter and disappear — or to throw away time and energy", synonyms: ["disperse", "scatter", "dissolve", "squander"], antonyms: ["gather", "concentrate", "conserve"], difficulty: 4, pos: "verb", example: "The morning mist dissipated as the sun rose." },
  { word: "dissuade", definition: "To persuade someone not to do something", simpleDefinition: "To talk someone out of doing something — to put them off the idea", synonyms: ["discourage", "deter", "prevent", "warn"], antonyms: ["encourage", "persuade", "urge"], difficulty: 3, pos: "verb", example: "He tried to dissuade her from making such a rash decision." },
  { word: "divulge", definition: "To make known information that was previously kept secret", simpleDefinition: "To reveal a secret — to let something out that was private", synonyms: ["reveal", "disclose", "expose", "confess"], antonyms: ["conceal", "withhold", "suppress"], difficulty: 3, pos: "verb", example: "She refused to divulge her source to the newspaper." },
  { word: "duplicity", definition: "Deceitfulness; saying one thing while meaning another", simpleDefinition: "Being two-faced — saying one thing but secretly doing another", synonyms: ["deceit", "dishonesty", "treachery", "guile"], antonyms: ["honesty", "sincerity", "integrity"], difficulty: 4, pos: "noun", example: "His duplicity was only discovered after years of lying." },
  { word: "ebullient", definition: "Overflowing with enthusiasm and excitement", simpleDefinition: "Bubbling over with energy and excitement — very enthusiastic", synonyms: ["enthusiastic", "exuberant", "vivacious", "bubbly"], antonyms: ["subdued", "gloomy", "apathetic"], difficulty: 4, pos: "adjective", example: "Her ebullient personality made her the heart of every gathering." },
  { word: "eclectic", definition: "Deriving ideas from a wide and diverse range of sources", simpleDefinition: "Taking from many different styles or sources — varied and wide-ranging", synonyms: ["diverse", "varied", "mixed", "wide-ranging"], antonyms: ["uniform", "narrow", "limited"], difficulty: 4, pos: "adjective", example: "Her eclectic music taste ranged from jazz to heavy metal." },
  { word: "effervescent", definition: "Bubbly, enthusiastic, and vivacious", simpleDefinition: "Fizzing with energy and enthusiasm — cheerfully lively", synonyms: ["bubbly", "vivacious", "lively", "enthusiastic"], antonyms: ["flat", "dull", "subdued"], difficulty: 4, pos: "adjective", example: "Her effervescent personality lit up the whole room." },
  { word: "emulate", definition: "To match or surpass someone by imitation", simpleDefinition: "To try to copy and be as good as someone you admire", synonyms: ["imitate", "copy", "follow", "mirror"], antonyms: ["ignore", "reject", "differ"], difficulty: 3, pos: "verb", example: "He tried to emulate his sporting hero in every way." },
  { word: "engender", definition: "To cause a feeling or situation to arise", simpleDefinition: "To create or cause something to develop — to bring it into being", synonyms: ["cause", "produce", "create", "generate"], antonyms: ["destroy", "suppress", "prevent"], difficulty: 4, pos: "verb", example: "The leader's speech engendered great hope in the crowd." },
  { word: "enumerate", definition: "To mention things one by one; to count", simpleDefinition: "To list things one by one in order", synonyms: ["list", "count", "itemise", "detail"], difficulty: 3, pos: "verb", example: "She enumerated all the reasons why the plan would fail." },
  { word: "ephemeral", definition: "Lasting for only a very short time", simpleDefinition: "Here one moment, gone the next — lasting only briefly", synonyms: ["fleeting", "transient", "brief", "momentary"], antonyms: ["permanent", "lasting", "enduring"], difficulty: 4, pos: "adjective", example: "The fame of reality TV stars is often ephemeral." },
  { word: "equanimity", definition: "Mental calmness in difficult situations", simpleDefinition: "Calm and composed even when things are difficult — unruffled", synonyms: ["composure", "calmness", "serenity", "poise"], antonyms: ["agitation", "anxiety", "panic"], difficulty: 4, pos: "noun", example: "She faced the crisis with remarkable equanimity." },
  { word: "erroneous", definition: "Wrong; based on error", simpleDefinition: "Incorrect — containing a mistake or based on false information", synonyms: ["incorrect", "wrong", "mistaken", "false"], antonyms: ["correct", "accurate", "right"], difficulty: 3, pos: "adjective", example: "The erroneous data led to completely wrong conclusions." },
  { word: "esoteric", definition: "Understood by only a small number of people with specialist knowledge", simpleDefinition: "Known to only a very few people — mysterious and specialist", synonyms: ["obscure", "specialist", "arcane", "cryptic"], antonyms: ["popular", "mainstream", "accessible"], difficulty: 4, pos: "adjective", example: "His lecture on ancient philosophy was highly esoteric." },
  { word: "ethereal", definition: "Extremely delicate and light; heavenly", simpleDefinition: "So light and delicate it seems almost not of this world", synonyms: ["delicate", "heavenly", "airy", "otherworldly"], antonyms: ["earthly", "solid", "coarse"], difficulty: 4, pos: "adjective", example: "Her singing had an ethereal quality that moved everyone." },
  { word: "evanescent", definition: "Soon passing out of sight, memory, or existence", simpleDefinition: "Vanishing quickly — like mist that disappears in the morning sun", synonyms: ["fleeting", "transient", "vanishing", "ephemeral"], antonyms: ["permanent", "lasting", "enduring"], difficulty: 5, pos: "adjective", example: "The evanescent beauty of the fireworks faded in seconds." },
  { word: "exuberance", definition: "The quality of being full of energy and excitement", simpleDefinition: "Overflowing with energy and joy — bubbling with enthusiasm", synonyms: ["enthusiasm", "vitality", "liveliness", "ebullience"], antonyms: ["apathy", "lethargy", "gloom"], difficulty: 3, pos: "noun", example: "The children's exuberance on sports day was infectious." },
  { word: "facile", definition: "Appearing neat but being too simple; easily achieved", simpleDefinition: "Too easy and shallow — not showing enough thought", synonyms: ["simplistic", "shallow", "glib", "superficial"], antonyms: ["profound", "complex", "thoughtful"], difficulty: 4, pos: "adjective", example: "His facile answer to a complicated question annoyed the professor." },
  { word: "fallacious", definition: "Based on a mistaken belief; misleading", simpleDefinition: "Based on a false idea — logically flawed or misleading", synonyms: ["false", "mistaken", "misleading", "erroneous"], antonyms: ["valid", "correct", "sound"], difficulty: 4, pos: "adjective", example: "The argument was fallacious from the start." },
  { word: "flagrant", definition: "Conspicuously wrong or offensive; shamelessly bad", simpleDefinition: "So obviously wrong that everyone can see it — blatant", synonyms: ["blatant", "obvious", "brazen", "glaring"], antonyms: ["subtle", "concealed", "minor"], difficulty: 3, pos: "adjective", example: "It was a flagrant foul that left the referee no choice." },
  { word: "fortuitous", definition: "Happening by lucky chance; not planned", simpleDefinition: "A lucky coincidence — something good that happened by chance", synonyms: ["lucky", "fortunate", "chance", "accidental"], antonyms: ["deliberate", "planned", "unfortunate"], difficulty: 4, pos: "adjective", example: "Their meeting was entirely fortuitous — neither had planned to be there." },
  { word: "furtive", definition: "Attempting to avoid notice; secretive and shifty", simpleDefinition: "Sneaky and secretive — trying not to be noticed", synonyms: ["sneaky", "secretive", "shifty", "covert"], antonyms: ["open", "bold", "transparent"], difficulty: 3, pos: "adjective", example: "He cast a furtive glance over his shoulder before opening the drawer." },
  { word: "garrulous", definition: "Excessively talkative, especially about trivial things", simpleDefinition: "Unable to stop talking — chattering on about nothing important", synonyms: ["talkative", "chatty", "verbose", "loquacious"], antonyms: ["quiet", "reserved", "taciturn"], difficulty: 4, pos: "adjective", example: "The garrulous shopkeeper delayed every customer with his stories." },
  { word: "gratuitous", definition: "Uncalled for; lacking good reason; unnecessary", simpleDefinition: "Done without reason — unnecessary and unwarranted", synonyms: ["unnecessary", "unjustified", "unwarranted", "excessive"], antonyms: ["necessary", "justified", "warranted"], difficulty: 4, pos: "adjective", example: "The film contained gratuitous violence that served no purpose." },
  { word: "gullible", definition: "Easily deceived or tricked into believing things", simpleDefinition: "Too easy to fool — believing anything you're told without question", synonyms: ["naive", "credulous", "trusting", "unsuspecting"], antonyms: ["sceptical", "suspicious", "shrewd"], difficulty: 2, pos: "adjective", example: "The gullible boy was tricked by the same prank twice." },
  { word: "hackneyed", definition: "Lacking originality; overused and therefore meaningless", simpleDefinition: "So overused it's lost all meaning — a tired cliché", synonyms: ["clichéd", "stale", "overused", "trite"], antonyms: ["original", "fresh", "innovative"], difficulty: 4, pos: "adjective", example: "The speech was full of hackneyed phrases that moved no one." },
  { word: "heinous", definition: "Utterly evil and wicked", simpleDefinition: "Extremely evil and wicked — morally terrible", synonyms: ["wicked", "evil", "monstrous", "vile"], antonyms: ["virtuous", "good", "noble"], difficulty: 3, pos: "adjective", example: "The heinous crime shocked the entire country." },
  { word: "illicit", definition: "Forbidden by law, rules, or custom", simpleDefinition: "Illegal or against the rules — not allowed", synonyms: ["illegal", "unlawful", "forbidden", "prohibited"], antonyms: ["legal", "lawful", "permitted"], difficulty: 3, pos: "adjective", example: "He was caught in possession of illicit goods." },
  { word: "immaculate", definition: "Perfectly clean, neat, or correct; without flaw", simpleDefinition: "Completely spotless and perfect — without a single flaw", synonyms: ["spotless", "flawless", "perfect", "pristine"], antonyms: ["dirty", "flawed", "imperfect"], difficulty: 3, pos: "adjective", example: "Her essay was immaculate — not a single error." },
  { word: "impassive", definition: "Not feeling or showing emotion; expressionless", simpleDefinition: "Showing no emotion at all — a completely blank expression", synonyms: ["expressionless", "stoic", "emotionless", "blank"], antonyms: ["emotional", "expressive", "passionate"], difficulty: 3, pos: "adjective", example: "The judge remained impassive throughout the emotional testimony." },
  { word: "impromptu", definition: "Done without preparation or planning; spontaneous", simpleDefinition: "Done on the spot with no preparation — unplanned", synonyms: ["unplanned", "spontaneous", "unrehearsed", "improvised"], antonyms: ["planned", "rehearsed", "prepared"], difficulty: 3, pos: "adjective", example: "She gave an impromptu speech that moved everyone to tears." },
  { word: "indomitable", definition: "Impossible to subdue or defeat", simpleDefinition: "Impossible to beat or break — always bouncing back", synonyms: ["invincible", "unconquerable", "determined", "resolute"], antonyms: ["weak", "yielding", "defeatist"], difficulty: 4, pos: "adjective", example: "Her indomitable spirit carried her through the toughest times." },
  { word: "insidious", definition: "Proceeding gradually and harmfully but in a subtle way", simpleDefinition: "Slowly causing harm in a sneaky way — dangerous without being obvious", synonyms: ["sneaky", "subtle", "treacherous", "stealthy"], antonyms: ["obvious", "open", "harmless"], difficulty: 4, pos: "adjective", example: "The insidious rumour spread slowly through the school." },
  { word: "introspective", definition: "Examining one's own thoughts and feelings", simpleDefinition: "Looking inward at your own feelings and thoughts", synonyms: ["reflective", "thoughtful", "self-examining", "contemplative"], antonyms: ["thoughtless", "outgoing", "unreflective"], difficulty: 4, pos: "adjective", example: "After the argument she became very introspective and quiet." },
  { word: "irreproachable", definition: "Beyond criticism; blameless", simpleDefinition: "Impossible to criticise — completely blameless and excellent", synonyms: ["blameless", "faultless", "impeccable", "exemplary"], antonyms: ["blameworthy", "guilty", "flawed"], difficulty: 4, pos: "adjective", example: "Her conduct throughout the investigation was irreproachable." },
  { word: "jocular", definition: "Fond of jokes; humorous and playful", simpleDefinition: "Fond of joking around — light-hearted and full of humour", synonyms: ["humorous", "playful", "witty", "jovial"], antonyms: ["serious", "solemn", "grave"], difficulty: 4, pos: "adjective", example: "His jocular manner put everyone at ease during the difficult meeting." },
  { word: "laconic", definition: "Using very few words to express something", simpleDefinition: "Saying a lot in very few words — brief and to the point", synonyms: ["brief", "concise", "terse", "succinct"], antonyms: ["verbose", "wordy", "long-winded"], difficulty: 4, pos: "adjective", example: "His laconic reply told us everything we needed to know." },
  { word: "languish", definition: "To lose strength or vitality; to be kept in poor conditions", simpleDefinition: "To slowly weaken and suffer — stuck in difficult conditions", synonyms: ["wither", "fade", "decline", "suffer"], antonyms: ["thrive", "flourish", "prosper"], difficulty: 3, pos: "verb", example: "The prisoners languished in the dark cells for years." },
  { word: "lassitude", definition: "Physical or mental weariness; lack of energy", simpleDefinition: "A deep tiredness and lack of energy — feeling utterly worn out", synonyms: ["weariness", "fatigue", "lethargy", "exhaustion"], antonyms: ["energy", "vigour", "vitality"], difficulty: 4, pos: "noun", example: "A sense of lassitude overcame her after weeks of overwork." },
  { word: "legacy", definition: "Something handed down from the past; a long-lasting impact", simpleDefinition: "Something important left behind — a lasting impact on the future", synonyms: ["heritage", "inheritance", "impact", "bequest"], difficulty: 3, pos: "noun", example: "The charity was her legacy — it continued long after her death." },
  { word: "levity", definition: "Treating serious matters with lightness or humour", simpleDefinition: "Making light of something serious — bringing humour when it's not appropriate", synonyms: ["humour", "lightness", "flippancy", "frivolity"], antonyms: ["seriousness", "gravity", "solemnity"], difficulty: 4, pos: "noun", example: "His levity at the funeral was considered disrespectful." },
  { word: "loquacious", definition: "Tending to talk a great deal; very talkative", simpleDefinition: "A non-stop talker — always chatting, always filling the silence", synonyms: ["talkative", "chatty", "garrulous", "verbose"], antonyms: ["taciturn", "quiet", "reserved"], difficulty: 4, pos: "adjective", example: "The loquacious guest kept the whole table entertained for hours." },
  { word: "lurid", definition: "Unpleasantly vivid or shocking; sensationally graphic", simpleDefinition: "Shockingly vivid — describing horrible things in graphic detail", synonyms: ["graphic", "shocking", "vivid", "sensational"], antonyms: ["subtle", "mild", "restrained"], difficulty: 3, pos: "adjective", example: "The newspaper gave a lurid account of the crime." },
  { word: "malleable", definition: "Easily shaped or influenced; pliable", simpleDefinition: "Easy to shape or influence — willing to change to fit the situation", synonyms: ["flexible", "pliable", "adaptable", "impressionable"], antonyms: ["rigid", "inflexible", "stubborn"], difficulty: 3, pos: "adjective", example: "Young children have malleable minds that absorb ideas quickly." },
  { word: "maverick", definition: "An independent-minded person who does not follow convention", simpleDefinition: "Someone who does things their own way — not following the crowd", synonyms: ["rebel", "nonconformist", "individualist", "dissenter"], antonyms: ["conformist", "follower", "traditionalist"], difficulty: 3, pos: "noun", example: "The maverick scientist ignored convention and made a breakthrough discovery." },
  { word: "mercurial", definition: "Subject to sudden changes of mood; unpredictable", simpleDefinition: "Changing mood very quickly — impossible to predict", synonyms: ["volatile", "unpredictable", "impulsive", "erratic"], antonyms: ["steady", "consistent", "stable"], difficulty: 4, pos: "adjective", example: "His mercurial temperament made him difficult to work with." },
  { word: "misanthrope", definition: "A person who dislikes and distrusts other people", simpleDefinition: "Someone who dislikes and avoids people — suspicious of everyone", synonyms: ["recluse", "cynic", "hermit"], antonyms: ["philanthropist", "humanitarian"], difficulty: 4, pos: "noun", example: "The old misanthrope refused all visitors and lived alone." },
  { word: "morbid", definition: "Having an unhealthy interest in death and unpleasant things", simpleDefinition: "Obsessed with death and gruesome things — unhealthily dark", synonyms: ["gloomy", "dark", "macabre", "ghoulish"], antonyms: ["cheerful", "optimistic", "healthy"], difficulty: 3, pos: "adjective", example: "He had a morbid fascination with crime stories." },
  { word: "munificent", definition: "Larger or more generous than is usual or necessary", simpleDefinition: "Extremely generous — giving far more than expected", synonyms: ["generous", "lavish", "bountiful", "liberal"], antonyms: ["stingy", "mean", "parsimonious"], difficulty: 4, pos: "adjective", example: "The munificent donor gave a million pounds to the hospital." },
  { word: "nefarious", definition: "Wicked and criminal; morally very wrong", simpleDefinition: "Thoroughly wicked and criminal — evil in a deliberate way", synonyms: ["wicked", "villainous", "criminal", "evil"], antonyms: ["virtuous", "honourable", "lawful"], difficulty: 4, pos: "adjective", example: "The gang's nefarious activities were finally exposed." },
  { word: "nemesis", definition: "A long-standing rival; a source of downfall", simpleDefinition: "Your greatest enemy and rival — the one who brings you down", synonyms: ["rival", "adversary", "downfall", "enemy"], antonyms: ["ally", "friend", "champion"], difficulty: 3, pos: "noun", example: "The defending champion finally met his nemesis in the final." },
  { word: "nullify", definition: "To make something legally void or of no effect", simpleDefinition: "To cancel something out — to make it have no effect or value", synonyms: ["cancel", "invalidate", "void", "annul"], antonyms: ["validate", "confirm", "uphold"], difficulty: 4, pos: "verb", example: "The new law nullified the previous agreement." },
  { word: "obfuscate", definition: "To make something unclear or difficult to understand", simpleDefinition: "To deliberately confuse — making something hard to understand on purpose", synonyms: ["confuse", "obscure", "muddle", "bewilder"], antonyms: ["clarify", "explain", "illuminate"], difficulty: 5, pos: "verb", example: "He obfuscated his real intentions with complicated language." },
  { word: "officious", definition: "Intrusively asserting authority in a way that is unwanted", simpleDefinition: "Bossily interfering — enforcing rules nobody asked you to enforce", synonyms: ["bossy", "interfering", "overbearing", "intrusive"], antonyms: ["humble", "reserved", "unassuming"], difficulty: 4, pos: "adjective", example: "The officious security guard checked everyone's badge twice." },
  { word: "opulent", definition: "Ostentatiously rich and luxurious", simpleDefinition: "Richly luxurious — showing off extreme wealth and splendour", synonyms: ["lavish", "luxurious", "wealthy", "sumptuous"], antonyms: ["humble", "modest", "austere"], difficulty: 3, pos: "adjective", example: "The opulent mansion had a swimming pool in every wing." },
  { word: "oscillate", definition: "To move back and forth; to waver between two opinions", simpleDefinition: "To swing back and forth — or to keep changing your mind", synonyms: ["swing", "waver", "fluctuate", "vacillate"], antonyms: ["stabilise", "settle", "decide"], difficulty: 4, pos: "verb", example: "She oscillated between excitement and fear as the day approached." },
  { word: "panache", definition: "A confident, stylish manner in doing something", simpleDefinition: "Doing something with confidence and style — real flair", synonyms: ["flair", "style", "verve", "elegance"], antonyms: ["clumsiness", "dullness", "mediocrity"], difficulty: 4, pos: "noun", example: "She delivered her speech with incredible panache." },
  { word: "paradox", definition: "A statement that contradicts itself but may be true", simpleDefinition: "Something that seems impossible or contradictory — but may actually be true", synonyms: ["contradiction", "inconsistency", "anomaly"], difficulty: 4, pos: "noun", example: "It's a paradox that the more you hurry, the longer things seem to take." },
  { word: "pedantic", definition: "Excessively concerned with minor rules and details", simpleDefinition: "Annoyingly fussy about rules and details — getting hung up on tiny things", synonyms: ["fussy", "pernickety", "fastidious", "nitpicking"], antonyms: ["relaxed", "flexible", "easygoing"], difficulty: 4, pos: "adjective", example: "His pedantic corrections to every little spelling mistake drove people mad." },
  { word: "perfunctory", definition: "Done with minimum effort; carried out as routine", simpleDefinition: "Done carelessly with as little effort as possible — just going through the motions", synonyms: ["cursory", "careless", "superficial", "hasty"], antonyms: ["thorough", "careful", "diligent"], difficulty: 4, pos: "adjective", example: "The doctor gave a perfunctory examination and sent the patient home." },
  { word: "pernicious", definition: "Having a harmful effect, especially in a subtle way", simpleDefinition: "Slowly causing serious harm in a hidden way — insidiously dangerous", synonyms: ["harmful", "destructive", "dangerous", "malicious"], antonyms: ["beneficial", "harmless", "helpful"], difficulty: 4, pos: "adjective", example: "The pernicious influence of gossip damaged many friendships." },
  { word: "picturesque", definition: "Visually attractive, especially in a quaint way", simpleDefinition: "So beautiful it looks like a picture — charming and attractive", synonyms: ["scenic", "beautiful", "charming", "quaint"], antonyms: ["ugly", "bleak", "unattractive"], difficulty: 3, pos: "adjective", example: "The picturesque village attracted tourists from across the world." },
  { word: "plethora", definition: "A large or excessive amount of something", simpleDefinition: "Way more than enough — an overwhelming abundance", synonyms: ["abundance", "excess", "surplus", "overabundance"], antonyms: ["shortage", "scarcity", "lack"], difficulty: 3, pos: "noun", example: "There was a plethora of options on the menu." },
  { word: "ponderous", definition: "Slow and clumsy; too heavy; dull and laborious", simpleDefinition: "Heavy, slow and dull — moving or speaking without any lightness", synonyms: ["heavy", "slow", "cumbersome", "tedious"], antonyms: ["light", "nimble", "lively"], difficulty: 3, pos: "adjective", example: "The speaker's ponderous delivery put half the audience to sleep." },
  { word: "proliferate", definition: "To increase rapidly in number", simpleDefinition: "To grow and spread very quickly — multiplying fast", synonyms: ["multiply", "increase", "expand", "spread"], antonyms: ["decrease", "decline", "dwindle"], difficulty: 4, pos: "verb", example: "Weeds began to proliferate after the dry spell ended." },
  { word: "prophetic", definition: "Accurately predicting what will happen in the future", simpleDefinition: "Turning out to be true — predicting the future correctly", synonyms: ["visionary", "predictive", "farsighted", "prescient"], antonyms: ["mistaken", "inaccurate", "shortsighted"], difficulty: 4, pos: "adjective", example: "Her warning turned out to be prophetic — the company collapsed a year later." },
  { word: "protagonist", definition: "The main character in a story; a leading figure", simpleDefinition: "The main character or hero in a story", synonyms: ["hero", "lead", "central character", "champion"], antonyms: ["antagonist", "villain", "minor character"], difficulty: 3, pos: "noun", example: "The protagonist of the novel faces almost impossible challenges." },
  { word: "pugnacious", definition: "Eager to argue or fight; combative", simpleDefinition: "Always spoiling for a fight — aggressive and confrontational", synonyms: ["aggressive", "combative", "belligerent", "quarrelsome"], antonyms: ["peaceful", "gentle", "conciliatory"], difficulty: 4, pos: "adjective", example: "The pugnacious politician started arguments at every meeting." },
  { word: "quintessential", definition: "Representing the most perfect example of something", simpleDefinition: "The absolute perfect example — the best or purest version of something", synonyms: ["typical", "classic", "definitive", "archetypal"], antonyms: ["atypical", "unrepresentative", "unusual"], difficulty: 4, pos: "adjective", example: "He was the quintessential English gentleman." },
  { word: "rancour", definition: "Bitterness or resentment, especially long-lasting", simpleDefinition: "Deep, long-lasting bitterness and resentment", synonyms: ["bitterness", "resentment", "hostility", "animosity"], antonyms: ["goodwill", "forgiveness", "warmth"], difficulty: 4, pos: "noun", example: "Years of rivalry had bred rancour between the two families." },
  { word: "rapacious", definition: "Aggressively greedy; taking as much as possible", simpleDefinition: "Greedily grabbing as much as possible — never satisfied", synonyms: ["greedy", "grasping", "avaricious", "voracious"], antonyms: ["generous", "giving", "satisfied"], difficulty: 4, pos: "adjective", example: "The rapacious landlord raised rents three times in a year." },
  { word: "recalcitrant", definition: "Having an obstinately uncooperative attitude", simpleDefinition: "Stubbornly refusing to cooperate — won't follow orders no matter what", synonyms: ["stubborn", "defiant", "uncooperative", "obstinate"], antonyms: ["obedient", "cooperative", "compliant"], difficulty: 4, pos: "adjective", example: "The recalcitrant prisoner refused to follow any of the rules." },
  { word: "relegate", definition: "To assign to a lower position or less important role", simpleDefinition: "To move someone or something to a lower, less important position", synonyms: ["demote", "downgrade", "banish", "reduce"], antonyms: ["promote", "elevate", "advance"], difficulty: 3, pos: "verb", example: "After their poor season the team was relegated to a lower division." },
  { word: "renegade", definition: "A person who deserts their cause; a rebel", simpleDefinition: "Someone who betrays their group and goes their own way", synonyms: ["traitor", "rebel", "deserter", "outlaw"], antonyms: ["loyalist", "conformist", "supporter"], difficulty: 3, pos: "noun", example: "The renegade soldier crossed enemy lines and was never seen again." },
  { word: "reprehensible", definition: "Deserving censure or condemnation", simpleDefinition: "So wrong it deserves to be criticised — thoroughly blameworthy", synonyms: ["deplorable", "shameful", "disgraceful", "contemptible"], antonyms: ["admirable", "praiseworthy", "exemplary"], difficulty: 4, pos: "adjective", example: "His reprehensible treatment of the staff finally led to his dismissal." },
  { word: "resplendent", definition: "Attractive and impressive in appearance", simpleDefinition: "Strikingly beautiful and impressive — dazzling to look at", synonyms: ["magnificent", "dazzling", "glorious", "splendid"], antonyms: ["drab", "dull", "plain"], difficulty: 4, pos: "adjective", example: "The bride looked resplendent in her gown." },
  { word: "sagacious", definition: "Having or showing good judgement; perceptive and wise", simpleDefinition: "Very wise and perceptive — seeing things others miss", synonyms: ["wise", "perceptive", "shrewd", "astute"], antonyms: ["foolish", "naive", "obtuse"], difficulty: 4, pos: "adjective", example: "The sagacious adviser spotted the flaw in the plan immediately." },
  { word: "sedentary", definition: "Tending to sit and do little physical exercise", simpleDefinition: "Sitting down all the time — doing very little physical activity", synonyms: ["inactive", "stationary", "still", "sluggish"], antonyms: ["active", "energetic", "mobile"], difficulty: 3, pos: "adjective", example: "A sedentary lifestyle can be harmful to your health." },
  { word: "serendipity", definition: "The occurrence of fortunate events by happy chance", simpleDefinition: "Lucky discoveries made by accident — a happy coincidence", synonyms: ["luck", "chance", "fortune", "coincidence"], antonyms: ["misfortune", "design", "intention"], difficulty: 4, pos: "noun", example: "Meeting her future business partner was pure serendipity." },
  { word: "servile", definition: "Excessively willing to serve or obey; fawning", simpleDefinition: "Overly eager to please and obey — like a servant who never says no", synonyms: ["obsequious", "fawning", "submissive", "grovelling"], antonyms: ["assertive", "independent", "defiant"], difficulty: 4, pos: "adjective", example: "His servile attitude towards the boss embarrassed his colleagues." },
  { word: "slovenly", definition: "Messy and carelessly dressed or done", simpleDefinition: "Untidy and careless — not bothering to keep yourself or your work neat", synonyms: ["untidy", "scruffy", "careless", "dishevelled"], antonyms: ["neat", "tidy", "meticulous"], difficulty: 3, pos: "adjective", example: "His slovenly appearance made a poor impression at the interview." },
  { word: "squalor", definition: "The state of being extremely dirty and unpleasant", simpleDefinition: "Extreme filth and neglect — deeply unpleasant, dirty conditions", synonyms: ["filth", "dirt", "degradation", "poverty"], antonyms: ["cleanliness", "luxury", "comfort"], difficulty: 3, pos: "noun", example: "The refugees were living in absolute squalor." },
  { word: "spurious", definition: "Not genuine; false or fake", simpleDefinition: "Not genuine — made to look real but actually false", synonyms: ["false", "fake", "bogus", "counterfeit"], antonyms: ["genuine", "authentic", "real"], difficulty: 4, pos: "adjective", example: "The court dismissed his spurious claim immediately." },
  { word: "subterfuge", definition: "Deceit used in order to achieve a goal", simpleDefinition: "Trickery and deceit used to get what you want secretly", synonyms: ["deception", "trickery", "deceit", "guile"], antonyms: ["honesty", "openness", "transparency"], difficulty: 4, pos: "noun", example: "He used subterfuge to gain access to the classified files." },
  { word: "surreptitious", definition: "Done secretly without others knowing", simpleDefinition: "Done in secret and hoping not to be caught — sneaky", synonyms: ["secret", "covert", "furtive", "stealthy"], antonyms: ["open", "obvious", "transparent"], difficulty: 4, pos: "adjective", example: "She took a surreptitious look at his answers during the test." },
  { word: "tirade", definition: "A long, angry speech criticising something", simpleDefinition: "A long, furious rant — an angry outpouring of criticism", synonyms: ["rant", "diatribe", "harangue", "outburst"], antonyms: ["praise", "compliment", "commendation"], difficulty: 3, pos: "noun", example: "The manager launched into a tirade against the referee." },
  { word: "ubiquitous", definition: "Present everywhere at the same time; very widespread", simpleDefinition: "Everywhere you look — seemingly existing in all places at once", synonyms: ["universal", "widespread", "pervasive", "omnipresent"], antonyms: ["rare", "scarce", "uncommon"], difficulty: 4, pos: "adjective", example: "Smartphones have become ubiquitous in modern life." },
  { word: "usurp", definition: "To take power or a position by force or without right", simpleDefinition: "To illegally seize power or a position that isn't yours", synonyms: ["seize", "commandeer", "overthrow", "claim"], antonyms: ["surrender", "relinquish", "yield"], difficulty: 4, pos: "verb", example: "The general usurped the throne after the old king died." },
  { word: "vacillate", definition: "To waver between different opinions or actions; to be indecisive", simpleDefinition: "To keep changing your mind — unable to decide or commit", synonyms: ["waver", "hesitate", "dither", "fluctuate"], antonyms: ["decide", "commit", "resolve"], difficulty: 4, pos: "verb", example: "She vacillated for weeks before finally accepting the job offer." },
  { word: "venerable", definition: "Accorded a great deal of respect because of wisdom or age", simpleDefinition: "Deeply respected — usually because of great age, experience or wisdom", synonyms: ["respected", "esteemed", "revered", "distinguished"], antonyms: ["disrespected", "obscure", "insignificant"], difficulty: 3, pos: "adjective", example: "The venerable professor had taught at the university for fifty years." },
  { word: "vicarious", definition: "Experienced through another person rather than directly", simpleDefinition: "Living through someone else's experiences — feeling what they feel", synonyms: ["indirect", "secondhand", "surrogate", "empathetic"], antonyms: ["direct", "firsthand", "personal"], difficulty: 4, pos: "adjective", example: "She got vicarious pleasure from watching her daughter succeed." },
  { word: "vilify", definition: "To speak about someone in an abusively critical way", simpleDefinition: "To say very bad things about someone — to attack them with words", synonyms: ["defame", "slander", "criticise", "denounce"], antonyms: ["praise", "commend", "defend"], difficulty: 4, pos: "verb", example: "The newspaper vilified the politician without any real evidence." },
  { word: "virulent", definition: "Extremely harmful or poisonous; intensely hostile", simpleDefinition: "Extremely harmful and spreading rapidly — or savagely hostile", synonyms: ["toxic", "harmful", "dangerous", "venomous"], antonyms: ["harmless", "benign", "mild"], difficulty: 4, pos: "adjective", example: "The virulent strain of flu swept through the whole school in a week." },
  { word: "vitriolic", definition: "Filled with bitter and abusive criticism", simpleDefinition: "Savagely critical and bitter — words that burn like acid", synonyms: ["bitter", "scathing", "venomous", "caustic"], antonyms: ["kind", "gentle", "complimentary"], difficulty: 4, pos: "adjective", example: "Her vitriolic response shocked everyone who heard it." },
  { word: "vociferous", definition: "Expressing strong opinions loudly and forcefully", simpleDefinition: "Loud and forceful — making yourself heard at all costs", synonyms: ["loud", "outspoken", "strident", "clamorous"], antonyms: ["quiet", "reserved", "subdued"], difficulty: 4, pos: "adjective", example: "The vociferous protesters blocked the entrance to the building." },
  { word: "voracious", definition: "Consuming or wanting something in great quantities", simpleDefinition: "Wanting and consuming huge amounts — never satisfied", synonyms: ["hungry", "ravenous", "greedy", "insatiable"], antonyms: ["satisfied", "moderate", "content"], difficulty: 3, pos: "adjective", example: "She was a voracious reader who finished a book every two days." },
  { word: "wilful", definition: "Intentional, or stubbornly determined to do what one wants", simpleDefinition: "Done on purpose — or stubbornly insisting on your own way", synonyms: ["deliberate", "intentional", "obstinate", "headstrong"], antonyms: ["accidental", "compliant", "obedient"], difficulty: 3, pos: "adjective", example: "His wilful disregard for the rules infuriated the teacher." },
];

const WORD_MAP = Object.fromEntries(VOCAB_BANK.map(w => [w.word, w]));

// ─── DISTRACTOR DICTIONARY ────────────────────────────────────────────────────
// Definition data for words that appear as distractors but aren't target words.
// Display only — never tested, never tracked in Leitner.
const DISTRACTOR_DICT = {
  "abandon": { definition: "To give up or relinquish control of, to surrender or to give oneself over, or to yield to one's emotions.", simpleDefinition: "To give up or leave something behind" },
  "abundant": { definition: "Fully sufficient; found in copious supply; in great quantity; overflowing.", simpleDefinition: "Having more than enough of something" },
  "achievable": { definition: "Capable of being achieved, which either means possible or probable.", simpleDefinition: "Something that can actually be done" },
  "acrid": { definition: "Sharp and harsh, or bitter and not to the taste.", simpleDefinition: "Sharp and bitter — an unpleasant smell or taste" },
  "active": { definition: "Engaging in physical movement; lively and busy", simpleDefinition: "Always moving and doing things — not sitting still" },
  "adaptability": { definition: "The quality of being adaptable; a quality that renders adaptable.", simpleDefinition: "Being able to change to fit new situations" },
  "admire": { definition: "To be amazed at; to view with surprise; to marvel at.", simpleDefinition: "To look up to someone with respect" },
  "advance": { definition: "Completed before necessary or a milestone event.", simpleDefinition: "To move forward or make progress" },
  "affluent": { definition: "Abundant; copious; plenteous.", simpleDefinition: "Having lots of money; wealthy" },
  "aggravate": { definition: "To make (an offence) worse or more severe; to increase in offensiveness or heinousness.", simpleDefinition: "To make a problem or situation worse" },
  "aggressor": { definition: "The person or country that first attacks or makes an aggression; that begins hostility or a quarrel; an assailant.", simpleDefinition: "The person who starts a fight or attack" },
  "aggrieved": { definition: "Angry or resentful due to unjust treatment.", simpleDefinition: "Feeling upset because you've been treated unfairly" },
  "agitated": { definition: "Angry, annoyed, bothered or worked up.", simpleDefinition: "Feeling nervous, anxious and restless" },
  "agony": { definition: "Extreme pain.", simpleDefinition: "Extreme pain — physical or emotional" },
  "agreeable": { definition: "Pleasing, either to the mind or senses; pleasant; grateful.", simpleDefinition: "Pleasant and easy to get along with" },
  "agreed": { definition: "In harmony.", simpleDefinition: "Everyone said yes — no disagreement" },
  "alert": { definition: "Fully awake and attentive; ready to respond", simpleDefinition: "Wide awake and paying full attention" },
  "all": { definition: "All gone; dead.", simpleDefinition: "The whole amount — nothing left out" },
  "aloof": { definition: "Reserved and remote; either physically or emotionally distant; standoffish.", simpleDefinition: "Keeping to yourself — unfriendly and distant" },
  "amateur": { definition: "Non-professional.", simpleDefinition: "Someone who does something for fun, not as a job" },
  "ambiguous": { definition: "Open to multiple interpretations.", simpleDefinition: "Not clear — could mean more than one thing" },
  "ample": { definition: "Large; great in size, extent, capacity, or bulk; for example spacious, roomy or widely extended.", simpleDefinition: "More than enough — plenty of it" },
  "ancient": { definition: "Having lasted from a remote period; having been of long duration; of great age, very old.", simpleDefinition: "Very, very old — from a long time ago" },
  "angry": { definition: "Displaying or feeling anger.", simpleDefinition: "Feeling very cross and upset about something" },
  "anxious": { definition: "Feeling nervous or worried about what might happen", simpleDefinition: "Nervous and worried about what might happen" },
  "appalled": { definition: "Shocked, horrified by something unpleasant.", simpleDefinition: "Shocked and disgusted by something terrible" },
  "approach": { definition: "To come or go near, in place or time; to draw nigh; to advance nearer.", simpleDefinition: "To move closer to something or someone" },
  "approaching": { definition: "That approaches or approach.", simpleDefinition: "Getting nearer — coming towards you" },
  "appropriate": { definition: "Suitable or fit; proper.", simpleDefinition: "Suitable and right for the situation" },
  "approval": { definition: "An expression granting permission; an indication of agreement with a proposal; an acknowledgement that a person, thin...", simpleDefinition: "Agreeing that something is good or acceptable" },
  "arrogant": { definition: "Having an exaggerated sense of one's own importance", simpleDefinition: "Thinking you're better than everyone else" },
  "ascend": { definition: "To move upward, to fly, to soar.", simpleDefinition: "To climb or move upward" },
  "ashamed": { definition: "Feeling shame or guilt.", simpleDefinition: "Feeling bad and embarrassed about something you did" },
  "assertive": { definition: "Boldly self-assured; confident without being aggressive.", simpleDefinition: "Speaking up confidently for what you believe" },
  "assured": { definition: "Guaranteed; secure.", simpleDefinition: "Feeling confident and certain" },
  "astute": { definition: "Quickly and critically discerning.", simpleDefinition: "Clever at understanding situations quickly" },
  "attentive": { definition: "Paying attention; noticing, watching, listening, or attending closely.", simpleDefinition: "Paying close attention; listening carefully" },
  "attractive": { definition: "Causing attraction; having the quality of attracting by inherent force.", simpleDefinition: "Nice to look at; pleasing and appealing" },
  "avalanche": { definition: "To descend like an avalanche.", simpleDefinition: "A huge sudden rush of something — originally snow" },
  "average": { definition: "Constituting or relating to the average.", simpleDefinition: "Ordinary — not special, just in the middle" },
  "avoid": { definition: "To try not to meet or communicate with (a person); to shun", simpleDefinition: "To keep away from something on purpose" },
  "aware": { definition: "Vigilant or on one's guard against danger or difficulty.", simpleDefinition: "Knowing about something; noticing it" },
  "baffled": { definition: "Totally confused and unable to understand something", simpleDefinition: "Completely stumped — haven't got a clue" },
  "balanced": { definition: "Containing elements in appropriate proportion; proportionately weighted on all dimensions and therefore unlikely to t...", simpleDefinition: "Fair and steady — not going too far either way" },
  "bankrupt": { definition: "In a condition of bankruptcy; unable to pay one's debts.", simpleDefinition: "Having no money left — completely broke" },
  "be indifferent to": { definition: "To not care about something at all", simpleDefinition: "To just not care either way about something" },
  "begin": { definition: "To start, to initiate or take the first step into something.", simpleDefinition: "To start doing something" },
  "beginner": { definition: "Someone who is just starting at something, or has only recently started.", simpleDefinition: "Someone just starting to learn something new" },
  "believable": { definition: "Capable of being believed; credible.", simpleDefinition: "Something that seems true and can be trusted" },
  "bewail": { definition: "To wail over; to feel or express deep sorrow for", simpleDefinition: "To cry out or complain about something sad" },
  "biased": { definition: "Exhibiting bias; prejudiced.", simpleDefinition: "Unfairly favouring one side over another" },
  "bitter": { definition: "Having an acrid taste (usually from a basic substance).", simpleDefinition: "Having a sharp, unpleasant taste; feeling angry and resentful" },
  "blame": { definition: "Censure.", simpleDefinition: "To say someone is responsible for something bad" },
  "bland": { definition: "Having a soothing effect; not irritating or stimulating.", simpleDefinition: "Dull and uninteresting — nothing special about it" },
  "bleak": { definition: "Without color; pale; pallid.", simpleDefinition: "Cold and miserable — without any hope" },
  "blessing": { definition: "To make something holy by religious rite, sanctify.", simpleDefinition: "Something that makes life better; a stroke of luck" },
  "bloom": { definition: "A blossom; the flower of a plant; an expanded bud.", simpleDefinition: "To flower; to grow and develop well" },
  "bold": { definition: "A dwelling; habitation; building.", simpleDefinition: "Brave and confident — not afraid to act" },
  "boring": { definition: "Causing boredom; unable to engage or hold the interest.", simpleDefinition: "Not interesting at all — makes you want to yawn" },
  "brave": { definition: "Strong in the face of fear; courageous.", simpleDefinition: "Not scared — willing to face danger" },
  "break": { definition: "To separate into two or more pieces, to fracture or crack, by a process that cannot easily be reversed for reassembly.", simpleDefinition: "To separate into pieces; to stop following a rule" },
  "brief": { definition: "Of short duration; happening quickly.", simpleDefinition: "Lasting only a short time; short" },
  "bright": { definition: "Giving out or reflecting a lot of light; vivid and clear", simpleDefinition: "Full of light — shining and easy to see" },
  "brutality": { definition: "The state of being brutal.", simpleDefinition: "Savage violence and cruelty" },
  "brute": { definition: "Without reason or intelligence (of animals).", simpleDefinition: "A rough, violent and cruel person" },
  "bully": { definition: "Very good.", simpleDefinition: "Someone who hurts or frightens weaker people" },
  "calculated": { definition: "Arrived at or determined by mathematical calculation; ascertained mathematically.", simpleDefinition: "Done with careful thought and planning" },
  "calm": { definition: "Peaceful and free from anxiety or strong emotion", simpleDefinition: "Quiet and relaxed — not worried or upset" },
  "carefree": { definition: "Without cares or worries; free of concern or worries; without difficulty.", simpleDefinition: "Not having any worries — happy and relaxed" },
  "careful": { definition: "Giving attention to avoid danger, error or harm", simpleDefinition: "Paying close attention so nothing goes wrong" },
  "careless": { definition: "Not giving sufficient attention to avoiding mistakes", simpleDefinition: "Not being careful — making mistakes by not paying attention" },
  "catastrophe": { definition: "Any large and disastrous event of great significance", simpleDefinition: "A terrible disaster that causes huge damage" },
  "caustic": { definition: "Capable of burning, corroding or destroying organic tissue.", simpleDefinition: "Burning or eating through things; sharply critical" },
  "cautious": { definition: "Careful to avoid potential problems or dangers", simpleDefinition: "Taking care — looking out for danger before acting" },
  "cease": { definition: "To stop.", simpleDefinition: "To stop doing something completely" },
  "celebrate": { definition: "To extol or honour in a solemn manner.", simpleDefinition: "To do something enjoyable to mark a special occasion" },
  "censure": { definition: "To criticize harshly.", simpleDefinition: "Strong official criticism or disapproval" },
  "central": { definition: "Being in the centre.", simpleDefinition: "In the middle; the most important part" },
  "certain": { definition: "Completely sure about something; having no doubt", simpleDefinition: "Totally sure — no doubt about it at all" },
  "certainty": { definition: "The state of being certain.", simpleDefinition: "Being completely sure — no doubt at all" },
  "changeable": { definition: "Capable of being changed.", simpleDefinition: "Likely to change often; not staying the same" },
  "chaos": { definition: "The unordered state of matter in classical accounts of cosmogony.", simpleDefinition: "Complete disorder and confusion" },
  "chaotic": { definition: "Filled with chaos.", simpleDefinition: "Completely disorganised and out of control" },
  "charitable": { definition: "Pertaining to charity.", simpleDefinition: "Generous to people who are in need" },
  "charity": { definition: "An organization, the objective of which is to carry out a charitable purpose.", simpleDefinition: "Giving money or help to those who need it" },
  "charming": { definition: "Pleasant, charismatic.", simpleDefinition: "Very pleasant and attractive in manner" },
  "cheer": { definition: "To gladden; to make cheerful; often with up.", simpleDefinition: "To shout with joy; to make someone feel happier" },
  "cheerful": { definition: "Noticeably happy and optimistic", simpleDefinition: "Bright and happy — always looking on the bright side" },
  "cheerless": { definition: "Gloomy and without happiness or comfort", simpleDefinition: "Miserable and without any joy or brightness" },
  "chivalrous": { definition: "Honourable, especially to women; gallant.", simpleDefinition: "Polite and kind, especially towards others — like a knight" },
  "civilised": { definition: "Having a well-developed society with culture and law", simpleDefinition: "Having a developed society with rules and culture" },
  "clarity": { definition: "The quality of being clear and easy to understand", simpleDefinition: "Being clear and easy to understand" },
  "clear": { definition: "Transparent in colour.", simpleDefinition: "Easy to see or understand; not blocked" },
  "clear-headed": { definition: "Having the ability to think clearly and act appropriately", simpleDefinition: "Thinking in a calm and logical way" },
  "clever": { definition: "Quick to learn and understand; intelligent", simpleDefinition: "Good at learning and understanding things quickly" },
  "climb": { definition: "To go up something using effort; to ascend", simpleDefinition: "Going up — like climbing a tree or a hill" },
  "closure": { definition: "An event or occurrence that signifies an ending.", simpleDefinition: "An end to something; a feeling of resolution" },
  "cold": { definition: "Lacking warmth or friendliness; unfriendly in manner", simpleDefinition: "Unfriendly and distant — not warm or welcoming" },
  "collapse": { definition: "To break apart and fall down suddenly; to cave in.", simpleDefinition: "To fall down suddenly; to give way completely" },
  "colourful": { definition: "Full of interest, variety or vivid detail", simpleDefinition: "Bright and interesting — full of variety" },
  "combined": { definition: "Resulting from the addition of several sources, parts, elements, aspects, etc. able to be united together, to converge.", simpleDefinition: "Joined or mixed together into one" },
  "comeback": { definition: "A return (e.g. to popularity, success, etc.) after an extended period of obscurity.", simpleDefinition: "A return to success after a setback" },
  "comfort": { definition: "A state of ease and freedom from pain or worry", simpleDefinition: "A feeling of being at ease with no pain or worry" },
  "commandeer": { definition: "To seize for military use.", simpleDefinition: "To take official control of something" },
  "commendation": { definition: "The act of commending; praise; favorable representation in words; recommendation.", simpleDefinition: "Praise given officially for doing something well" },
  "commended": { definition: "Praised or recommended for good work", simpleDefinition: "Praised and recognised for doing well" },
  "compatible": { definition: "Able to exist or work together without problems", simpleDefinition: "Able to work or get on well together" },
  "compelling": { definition: "Powerfully persuasive; demanding attention", simpleDefinition: "So interesting or convincing it grabs your attention" },
  "compliance": { definition: "The act of following a rule or request", simpleDefinition: "Following rules and doing what you are told" },
  "compliant": { definition: "Willing to comply; submissive; willing to do what someone wants.", simpleDefinition: "Following rules and doing what is asked" },
  "composed": { definition: "Having control of one's feelings; calm and self-possessed", simpleDefinition: "Staying calm and in control even when things are hard" },
  "conclude": { definition: "To end; to come to an end.", simpleDefinition: "To bring something to an end; to decide" },
  "confident": { definition: "Very sure of something; positive.", simpleDefinition: "Feeling sure of yourself and your abilities" },
  "conflicting": { definition: "Being in opposition; not able to both be true", simpleDefinition: "Going against each other — can't both be right" },
  "confront": { definition: "To face a problem or person directly", simpleDefinition: "To face a difficult person or problem directly" },
  "confused": { definition: "Unable to think clearly; puzzled and uncertain", simpleDefinition: "Mixed up and not sure what's going on" },
  "confusion": { definition: "A state of being uncertain or unable to understand", simpleDefinition: "Being mixed up and not sure what is going on" },
  "conscientious": { definition: "Careful and thorough in doing what is right", simpleDefinition: "Very careful and thorough in doing the right thing" },
  "conscientious objector": { definition: "A person who refuses to do something on moral grounds", simpleDefinition: "Someone who refuses to do something they think is wrong" },
  "considered": { definition: "Having been carefully thought out.", simpleDefinition: "Thought about carefully before deciding" },
  "constant": { definition: "Unchanged through time or space; permanent.", simpleDefinition: "Happening all the time without stopping" },
  "contemplative": { definition: "Spending time thinking deeply and quietly", simpleDefinition: "Spending quiet time thinking deeply" },
  "content": { definition: "Satisfied", simpleDefinition: "Feeling happy and satisfied with things as they are" },
  "continuation": { definition: "The state of carrying on without stopping", simpleDefinition: "Carrying on with something without stopping" },
  "continue": { definition: "To carry on doing something without stopping", simpleDefinition: "To keep going without stopping" },
  "continuous": { definition: "Without interruption; going on without a break", simpleDefinition: "Going on and on without a break" },
  "controlled": { definition: "Kept calm and steady; not extreme or emotional", simpleDefinition: "Calm and steady — kept within limits" },
  "convinced": { definition: "Completely certain that something is true", simpleDefinition: "Totally sure that something is true" },
  "convincing": { definition: "Successful in making someone believe something", simpleDefinition: "Making you believe something is true" },
  "coordinated": { definition: "Organized, working together, cooperating", simpleDefinition: "Organised so everything works well together" },
  "corrupt": { definition: "Willing to act dishonestly in exchange for personal gain", simpleDefinition: "Dishonest and willing to break rules for gain" },
  "counterfeit": { definition: "Made as a fake copy to deceive people", simpleDefinition: "A fake copy designed to trick people" },
  "courageous": { definition: "Not deterred by danger or pain; brave", simpleDefinition: "Brave and willing to face danger" },
  "cowardly": { definition: "Lacking courage; too afraid to face danger", simpleDefinition: "Too afraid to face danger — not brave at all" },
  "crave": { definition: "To feel a strong desire for something", simpleDefinition: "To want something very strongly" },
  "credible": { definition: "Able to be believed; convincing and trustworthy", simpleDefinition: "Believable and trustworthy" },
  "credulous": { definition: "Excessively ready to believe things; gullible.", simpleDefinition: "Too ready to believe things without proof" },
  "critical": { definition: "Expressing disapproval; pointing out faults", simpleDefinition: "Finding fault with something; very important" },
  "criticism": { definition: "The expression of disapproval or judgement of faults", simpleDefinition: "Pointing out what is wrong or bad about something" },
  "cruel": { definition: "Causing pain or suffering without concern for others", simpleDefinition: "Deliberately causing pain — with no pity" },
  "cruelty": { definition: "Behaviour that causes pain or suffering to others", simpleDefinition: "Behaviour that causes pain or suffering on purpose" },
  "crumbling": { definition: "Breaking apart and falling to pieces gradually", simpleDefinition: "Slowly breaking apart and falling to pieces" },
  "current": { definition: "Belonging to the present time; happening now", simpleDefinition: "Happening right now — in the present" },
  "cut back": { definition: "To reduce the amount of (something).", simpleDefinition: "To reduce the amount of something" },
  "damaging": { definition: "Causing harm or injury to something", simpleDefinition: "Causing harm or making things worse" },
  "dangerous": { definition: "Likely to cause harm, injury or risk", simpleDefinition: "Could hurt you — not safe to be around" },
  "daring": { definition: "Willing to do dangerous or bold things", simpleDefinition: "Brave enough to do bold or risky things" },
  "dark": { definition: "With little or no light; gloomy and threatening", simpleDefinition: "With very little light; gloomy and threatening" },
  "daunting": { definition: "Making someone feel nervous or less confident", simpleDefinition: "Making you feel nervous — seems very difficult" },
  "dazzling": { definition: "Extremely impressive or bright", simpleDefinition: "Amazingly bright or impressive" },
  "dearth": { definition: "A scarcity or lack of something", simpleDefinition: "A very small amount — not nearly enough" },
  "decay": { definition: "To rot or break down gradually over time", simpleDefinition: "To slowly rot and break down over time" },
  "deceitful": { definition: "Deliberately misleading or cheating.", simpleDefinition: "Dishonest and likely to trick people" },
  "deceive": { definition: "To make someone believe something that is not true", simpleDefinition: "To make someone believe something that isn't true" },
  "decline": { definition: "To become smaller, weaker or worse over time", simpleDefinition: "To get smaller, weaker or worse over time" },
  "decrease": { definition: "To become or make smaller in size or amount", simpleDefinition: "To get smaller or less in amount" },
  "decrepit": { definition: "Worn out and in a bad state from age or neglect", simpleDefinition: "Old and falling apart from neglect" },
  "deferential": { definition: "Showing respect and submission to another person", simpleDefinition: "Very respectful and polite to someone" },
  "definite": { definition: "Clearly stated or decided; not uncertain", simpleDefinition: "Certain and clear — no doubt about it" },
  "dejected": { definition: "Feeling sad and low-spirited; downhearted", simpleDefinition: "Feeling sad and let down" },
  "delayed": { definition: "To put off until a later time; to defer.", simpleDefinition: "Made to happen later than expected" },
  "deliberate": { definition: "Done with full awareness and intention; not accidental", simpleDefinition: "Done on purpose — not by accident" },
  "delight": { definition: "Great pleasure and happiness", simpleDefinition: "A feeling of great pleasure and happiness" },
  "demanding": { definition: "Requiring a lot of effort, patience or ability", simpleDefinition: "Really hard work — takes a lot out of you" },
  "deplore": { definition: "To feel or express strong disapproval of something", simpleDefinition: "To feel strong disapproval about something" },
  "derelict": { definition: "In a very poor state due to neglect and abandonment", simpleDefinition: "Abandoned and in a terrible state" },
  "descent": { definition: "A downward movement; going from a higher to lower level", simpleDefinition: "Going down — moving to a lower level" },
  "desert": { definition: "To abandon someone when they need you", simpleDefinition: "To leave someone when they really need you" },
  "desire": { definition: "A strong feeling of wanting something", simpleDefinition: "A strong feeling of wanting something" },
  "desperate": { definition: "In dire need of something.", simpleDefinition: "Feeling hopeless and ready to do anything" },
  "despise": { definition: "To feel strong dislike or contempt for something", simpleDefinition: "To strongly dislike and look down on something" },
  "despondent": { definition: "Feeling very unhappy and without hope", simpleDefinition: "Feeling very sad with no hope" },
  "destructive": { definition: "Causing a great amount of damage or harm", simpleDefinition: "Causing a lot of damage and harm" },
  "determined": { definition: "Having a firm decision to do something; not giving up", simpleDefinition: "Set on doing something — not going to give up" },
  "difficult": { definition: "Needing much effort or skill to do or understand", simpleDefinition: "Hard to do or understand — needs effort" },
  "dilemma": { definition: "A situation where a difficult choice must be made", simpleDefinition: "A tough choice between two hard options" },
  "dim": { definition: "Not bright; giving off little light; not clearly seen", simpleDefinition: "Not bright — hard to see clearly" },
  "diminish": { definition: "To make or become smaller or less; to reduce", simpleDefinition: "Getting smaller or weaker over time" },
  "disagreeable": { definition: "Not agreeable, conformable, or congruous; contrary; unsuitable.", simpleDefinition: "Unpleasant and bad-tempered" },
  "disaster": { definition: "A sudden terrible event causing great damage or suffering", simpleDefinition: "A terrible event that causes great harm" },
  "discordant": { definition: "Not in agreement; harsh and unpleasant sounding", simpleDefinition: "Clashing and unpleasant — not in harmony" },
  "dishonest": { definition: "Not truthful or fair; likely to deceive or cheat", simpleDefinition: "Not telling the truth; likely to cheat" },
  "dishonesty": { definition: "The quality of being untruthful or likely to cheat", simpleDefinition: "Being untruthful and not to be trusted" },
  "dishonourable": { definition: "Bringing shame; not behaving in an honest or moral way", simpleDefinition: "Acting in a shameful, unethical way" },
  "disinclined": { definition: "Unwilling or reluctant to do something", simpleDefinition: "Not really wanting to do something" },
  "dislike": { definition: "A feeling of not liking something or someone", simpleDefinition: "A feeling of not liking someone or something" },
  "dismissed": { definition: "To discharge; to end the employment or service of.", simpleDefinition: "Told to leave; treated as unimportant" },
  "disorder": { definition: "A state of confusion and lack of organisation", simpleDefinition: "A mess — everything is confused and disorganised" },
  "disputed": { definition: "Argued about or challenged; not accepted as true", simpleDefinition: "Argued about — people disagree about it" },
  "disreputable": { definition: "Not considered respectable or trustworthy", simpleDefinition: "Having a bad reputation — not respected" },
  "disrespect": { definition: "A lack of courtesy or respect towards someone", simpleDefinition: "Not treating someone with the care they deserve" },
  "disrespectful": { definition: "Showing a lack of respect or courtesy", simpleDefinition: "Rude and not showing proper respect" },
  "dissonant": { definition: "Harsh and unpleasant sounding; not in harmony", simpleDefinition: "Harsh and clashing — not sounding good together" },
  "distant": { definition: "Far away in space or time; not closely connected", simpleDefinition: "Far away; not closely connected" },
  "distinguished": { definition: "Celebrated, well-known or eminent because of past achievements; prestigious", simpleDefinition: "Famous and greatly respected" },
  "distraught": { definition: "Very worried and upset; deeply troubled", simpleDefinition: "Very upset and troubled" },
  "distress": { definition: "Extreme worry, pain or suffering", simpleDefinition: "Extreme pain, worry or suffering" },
  "disturbed": { definition: "Having emotional or mental problems; unsettled", simpleDefinition: "Troubled emotionally; unsettled" },
  "dive": { definition: "To plunge downward headfirst; a steep drop", simpleDefinition: "To plunge downward headfirst" },
  "divided": { definition: "Separated into parts; not in agreement", simpleDefinition: "Split apart; in disagreement" },
  "dodge": { definition: "To move quickly to avoid something; to escape", simpleDefinition: "To move quickly to avoid something" },
  "domestic": { definition: "Relating to the home or family; tame and not wild", simpleDefinition: "Related to the home; tame and not wild" },
  "doubt": { definition: "A feeling of uncertainty or lack of confidence", simpleDefinition: "A feeling that something might not be true" },
  "doubtful": { definition: "Feeling uncertain; not likely to be true", simpleDefinition: "Not sure; not very likely" },
  "dove": { definition: "A person who favours peaceful solutions", simpleDefinition: "Someone who prefers peaceful solutions" },
  "down-to-earth": { definition: "Practical; realistic; pragmatic.", simpleDefinition: "Practical and realistic; not showing off" },
  "downpour": { definition: "A heavy fall of rain", simpleDefinition: "Heavy rain falling all at once" },
  "dreary": { definition: "Dull, bleak and making you feel sad", simpleDefinition: "Dull and miserable — makes you feel gloomy" },
  "drop": { definition: "To fall or decrease in amount", simpleDefinition: "Falling down or getting less" },
  "drought": { definition: "A long period of little or no rainfall", simpleDefinition: "A long dry spell with almost no rain" },
  "dubious": { definition: "Hesitating or doubting; of questionable value", simpleDefinition: "Not quite sure; of questionable quality" },
  "dull": { definition: "Lacking interest, excitement or brightness; boring", simpleDefinition: "Really boring — nothing interesting about it" },
  "durability": { definition: "Permanence by virtue of the power to resist stress or force.", simpleDefinition: "The ability to last a long time without breaking" },
  "eager": { definition: "Strongly wanting to do or have something; keen and enthusiastic", simpleDefinition: "Really keen and excited to do something" },
  "early": { definition: "Before the usual or expected time", simpleDefinition: "Before the expected or usual time" },
  "ease": { definition: "To make something less difficult or painful", simpleDefinition: "To make something less painful or difficult" },
  "easy": { definition: "Achieved without great effort; not difficult", simpleDefinition: "Simple to do — no trouble at all" },
  "easy-going": { definition: "Relaxed and not easily worried or upset", simpleDefinition: "Relaxed and not easily stressed" },
  "economical": { definition: "Using as little money or resources as possible", simpleDefinition: "Careful with money and resources" },
  "ecstatic": { definition: "Feeling overwhelming happiness or excitement", simpleDefinition: "Overwhelmingly happy and excited" },
  "effective": { definition: "Producing the intended result; working well", simpleDefinition: "Working well and producing the right result" },
  "effortless": { definition: "Requiring no effort; done with great ease", simpleDefinition: "So easy it looks like you're not even trying" },
  "elevated": { definition: "Raised above normal level; high in rank or quality", simpleDefinition: "Raised up to a higher level" },
  "encouraging": { definition: "Giving courage, confidence or hope", simpleDefinition: "Making someone feel more confident and hopeful" },
  "end": { definition: "To bring something to a close; a final point", simpleDefinition: "To bring something to a close" },
  "enduring": { definition: "Lasting over a long period of time; permanent", simpleDefinition: "Lasting for a long time" },
  "energetic": { definition: "Having or showing great activity or vitality", simpleDefinition: "Full of energy — always on the go" },
  "enlighten": { definition: "To give someone greater knowledge or understanding", simpleDefinition: "To help someone understand something better" },
  "enthusiastic": { definition: "Having or showing great excitement and interest", simpleDefinition: "Really excited and keen — can't wait to get started" },
  "entirety": { definition: "The whole of something; with nothing left out", simpleDefinition: "The whole thing — nothing left out" },
  "eroding": { definition: "Gradually wearing away or destroying something", simpleDefinition: "Slowly wearing away or breaking down" },
  "escalate": { definition: "To become more intense or serious", simpleDefinition: "To get worse or more serious" },
  "escalation": { definition: "A rapid increase in the intensity of something", simpleDefinition: "A rapid increase in something bad" },
  "escape": { definition: "To get free from a dangerous or unpleasant situation", simpleDefinition: "To get free from a dangerous situation" },
  "essential": { definition: "Absolutely necessary; extremely important", simpleDefinition: "Absolutely needed — can't do without it" },
  "evade": { definition: "To get away from by cunning; to avoid by dexterity, subterfuge, address, or ingenuity; to elude; to cleverly escape from", simpleDefinition: "To escape from or avoid something cleverly" },
  "evasive": { definition: "Avoiding giving a direct answer; not honest", simpleDefinition: "Avoiding giving a straight answer" },
  "evident": { definition: "Plain and obvious; clearly seen or understood", simpleDefinition: "Completely obvious and easy to see" },
  "excellent": { definition: "Extremely good; of very high quality", simpleDefinition: "Extremely good — really outstanding" },
  "exceptional": { definition: "Unusually good; much better than average", simpleDefinition: "Much better than usual — really stands out" },
  "exciting": { definition: "Causing great enthusiasm and eagerness", simpleDefinition: "Making you feel really enthusiastic" },
  "exhausting": { definition: "Very tiring.", simpleDefinition: "Making you feel very tired" },
  "expand": { definition: "To become or make larger or more extensive", simpleDefinition: "To grow larger or more extensive" },
  "expert": { definition: "A person with great skill or knowledge in a subject", simpleDefinition: "Someone who knows a subject really well" },
  "explosive": { definition: "Able to cause a sudden violent burst; highly emotional", simpleDefinition: "Causing a sudden violent burst; highly emotional" },
  "extend": { definition: "To make something longer or larger", simpleDefinition: "To make something longer or larger" },
  "extra": { definition: "More than is usual or necessary; additional", simpleDefinition: "More than what is needed; additional" },
  "extravagant": { definition: "Spending much more than is necessary; excessive and showy", simpleDefinition: "Way over the top — spending loads more than needed" },
  "face": { definition: "To confront and deal with a difficult situation", simpleDefinition: "To deal with something difficult head-on" },
  "fade": { definition: "To gradually become less bright, clear or strong", simpleDefinition: "To slowly become less bright or strong" },
  "fail": { definition: "That is a failure.", simpleDefinition: "To not succeed at something" },
  "faint": { definition: "Very slight and barely noticeable; lacking strength", simpleDefinition: "Very weak and barely noticeable" },
  "fair": { definition: "Treating people equally and without favouritism", simpleDefinition: "Treating everyone equally — not taking sides" },
  "fake": { definition: "Not genuine; a copy or imitation meant to deceive", simpleDefinition: "Not real — a copy pretending to be the real thing" },
  "fall": { definition: "To move downward; to drop to a lower level", simpleDefinition: "Coming down — moving to a lower level" },
  "false": { definition: "Not true or correct; intended to deceive", simpleDefinition: "Not true; meant to deceive" },
  "falter": { definition: "To lose strength or confidence; to hesitate", simpleDefinition: "To lose confidence or become unsteady" },
  "familiar": { definition: "Well known because of being seen or heard before", simpleDefinition: "Well known from being seen or heard before" },
  "famished": { definition: "Extremely hungry", simpleDefinition: "Absolutely starving hungry" },
  "famous": { definition: "Known and recognised by many people", simpleDefinition: "Well known by lots of people" },
  "fearless": { definition: "Having no fear; brave and confident", simpleDefinition: "Not scared of anything — totally brave" },
  "feeble": { definition: "Deficient in physical strength", simpleDefinition: "Very weak and lacking strength or effort" },
  "fierce": { definition: "Very strong, violent or aggressive", simpleDefinition: "Very intense, powerful and aggressive" },
  "fierceness": { definition: "The quality of being very intense, violent or aggressive", simpleDefinition: "The quality of being very powerful and intense" },
  "finish": { definition: "To bring something to an end; to complete", simpleDefinition: "To bring something to its end" },
  "fleeting": { definition: "Lasting only a very short time", simpleDefinition: "Gone very quickly — over in a flash" },
  "flexible": { definition: "Able to change or be changed easily to suit new needs", simpleDefinition: "Able to change or bend easily" },
  "flippant": { definition: "Not showing a serious attitude; disrespectfully casual", simpleDefinition: "Not taking something seriously when you should" },
  "flood": { definition: "A large amount of water covering usually dry land", simpleDefinition: "A large area covered in water" },
  "fool": { definition: "To trick someone into believing something false", simpleDefinition: "To trick someone into believing something false" },
  "foolish": { definition: "Lacking good sense or judgement; unwise and silly", simpleDefinition: "Acting silly without thinking things through" },
  "forthcoming": { definition: "Approaching or about to take place.", simpleDefinition: "Coming or happening soon; willing to give information" },
  "forthright": { definition: "Direct and outspoken; saying what you think clearly", simpleDefinition: "Saying clearly and directly what you think" },
  "fortunate": { definition: "Having good luck; lucky", simpleDefinition: "Lucky — things have worked out well" },
  "fortune": { definition: "A large amount of money; good luck", simpleDefinition: "A large amount of money; good luck" },
  "fragility": { definition: "The quality of being easily broken or damaged", simpleDefinition: "Being easily broken or damaged" },
  "frank": { definition: "Open and honest in speech; saying what you really think", simpleDefinition: "Open and honest — saying exactly what you think" },
  "frenzied": { definition: "Wildly excited or uncontrolled", simpleDefinition: "Wildly excited and out of control" },
  "friendly": { definition: "Warm, approachable and easy to get on with", simpleDefinition: "Nice and easy to talk to — makes you feel welcome" },
  "full": { definition: "Containing the maximum possible amount that can fit in the space available.", simpleDefinition: "Containing as much as possible; complete" },
  "fundamental": { definition: "Of central importance; forming the essential base", simpleDefinition: "The most basic and important part" },
  "gainful": { definition: "Serving a useful purpose; producing profit or benefit", simpleDefinition: "Producing something useful or profitable" },
  "gap": { definition: "A space or opening between two things; a difference", simpleDefinition: "A space or opening between two things" },
  "generosity": { definition: "The quality of being willing to give freely", simpleDefinition: "Being willing to give freely to others" },
  "generous": { definition: "Willing to give more than is expected; kind and unselfish", simpleDefinition: "Happy to share and give — not selfish at all" },
  "genial": { definition: "Friendly, cheerful and good-natured", simpleDefinition: "Warm and cheerful — a pleasure to be around" },
  "gentle": { definition: "Mild and kind; not rough or violent", simpleDefinition: "Soft and careful — not rough or harsh" },
  "gentleman": { definition: "A man who is polite, well-mannered and honourable", simpleDefinition: "A polite, well-mannered and honourable man" },
  "gentleness": { definition: "The quality of being mild, kind and not rough", simpleDefinition: "Being soft, kind and not rough" },
  "genuine": { definition: "Truly what something is said to be; authentic and real", simpleDefinition: "The real thing — not a fake or a copy" },
  "give back": { definition: "To return something to its owner", simpleDefinition: "To return something to the person it belongs to" },
  "give up": { definition: "To surrender (someone or something)", simpleDefinition: "To stop trying and admit defeat" },
  "gloomy": { definition: "Dark and depressing; causing feelings of sadness", simpleDefinition: "Dark and miserable — makes you feel down" },
  "glory": { definition: "High fame or honour won by great achievement", simpleDefinition: "Great fame and honour from achievements" },
  "glowing": { definition: "Expressing great praise; warmly positive", simpleDefinition: "Full of warm praise; shining brightly" },
  "godsend": { definition: "An unexpected good fortune or benefit; a windfall.", simpleDefinition: "Something very helpful that arrives just in time" },
  "good": { definition: "Having the right qualities; kind and morally right", simpleDefinition: "Having the right qualities; kind and honest" },
  "good-humoured": { definition: "Cheerful and pleasant in manner", simpleDefinition: "Cheerful and pleasant to be around" },
  "goodness": { definition: "The quality of being honest, kind and morally right", simpleDefinition: "The quality of being kind and morally right" },
  "goodwill": { definition: "A favorably disposed attitude toward someone or something.", simpleDefinition: "Friendly and helpful feelings towards others" },
  "greedy": { definition: "Having greed; consumed by selfish desires.", simpleDefinition: "Wanting more than your fair share" },
  "grieve": { definition: "To cause sorrow or distress to.", simpleDefinition: "To feel very sad about a loss" },
  "grow": { definition: "To increase in size, amount or strength over time", simpleDefinition: "To get bigger or stronger over time" },
  "guarded": { definition: "Cautious; restrained.", simpleDefinition: "Careful about what you say; not fully open" },
  "gullible": { definition: "Too easily tricked or fooled into believing things", simpleDefinition: "Too easily tricked into believing things" },
  "happy": { definition: "Feeling or showing pleasure and contentment", simpleDefinition: "Feeling really good — pleased and content" },
  "hardship": { definition: "Difficulty or suffering caused by a lack of something", simpleDefinition: "Difficulty or suffering from lack of something" },
  "hardworking": { definition: "Always putting in a great deal of effort", simpleDefinition: "Always putting in a lot of effort" },
  "harmful": { definition: "Of a kind likely to be damaging; injurious", simpleDefinition: "Causing damage, injury or bad effects" },
  "harmless": { definition: "Incapable of causing harm or danger; safe", simpleDefinition: "Completely safe — nothing to worry about" },
  "harsh": { definition: "Unpleasantly rough to the touch or other senses.", simpleDefinition: "Very strict, unkind or unpleasant" },
  "hasty": { definition: "Acting in haste; being too hurried or quick", simpleDefinition: "Done too quickly without enough thought" },
  "hatred": { definition: "Strong aversion; intense dislike", simpleDefinition: "A very strong feeling of dislike" },
  "haughty": { definition: "Conveying in demeanour the assumption of superiority; disdainful, supercilious.", simpleDefinition: "Acting as if you are better than other people" },
  "hawk": { definition: "A person who favours aggressive or forceful action", simpleDefinition: "Someone who prefers forceful, aggressive action" },
  "hazardous": { definition: "Risky, dangerous, with the nature of a hazard.", simpleDefinition: "Risky and potentially dangerous" },
  "headstrong": { definition: "Determined to do as one pleases, and not as others want.", simpleDefinition: "Determined to do things your own way — stubborn" },
  "heroic": { definition: "Having the qualities of a hero; brave and determined", simpleDefinition: "Showing great bravery and determination" },
  "hesitant": { definition: "Tending to hesitate, wait, or proceed with caution or reservation.", simpleDefinition: "Slow to act because you're unsure or nervous" },
  "hidden": { definition: "Located or positioned out of sight; not visually apparent.", simpleDefinition: "Not visible — kept out of sight" },
  "high-minded": { definition: "Given to idealism.", simpleDefinition: "Having strong moral principles" },
  "historical": { definition: "Of, concerning, or in accordance with recorded history, (particularly) as opposed to legends, myths, and fictions.", simpleDefinition: "Related to events that happened in the past" },
  "honest": { definition: "Scrupulous with regard to telling the truth; not given to swindling, lying, or fraud; upright.", simpleDefinition: "Telling the truth and not deceiving anyone" },
  "honour": { definition: "To think of highly, to respect highly; to show respect for; to recognise the importance or spiritual value of", simpleDefinition: "Having great respect; doing the right thing" },
  "honourable": { definition: "Bringing or deserving honour; morally correct", simpleDefinition: "Acting with strong moral principles" },
  "honoured": { definition: "Treated with great respect and admiration", simpleDefinition: "Given great respect and admiration" },
  "hooligan": { definition: "A violent and noisy football (soccer) fan who routinely fights with supporters of opposing teams, often the member of...", simpleDefinition: "A rough person who causes trouble" },
  "hopeless": { definition: "Without hope; despairing; not expecting anything positive.", simpleDefinition: "With no chance of success or improvement" },
  "horrified": { definition: "Struck with horror.", simpleDefinition: "Feeling extreme shock and disgust" },
  "hostile": { definition: "Not friendly, appropriate to an enemy; showing the disposition of an enemy; showing ill will and malevolence, or a de...", simpleDefinition: "Unfriendly and aggressive" },
  "humble": { definition: "Not proud or arrogant; modest about one's own importance", simpleDefinition: "Not showing off — quiet about how good you are" },
  "humility": { definition: "The characteristic of being humble; humbleness in character and behavior.", simpleDefinition: "Not thinking you are better than others" },
  "idle": { definition: "Empty, vacant.", simpleDefinition: "Not working or being active; doing nothing" },
  "ignorant": { definition: "Unknowledgeable or uneducated; characterized by ignorance.", simpleDefinition: "Not knowing about something; uneducated" },
  "ignored": { definition: "To deliberately not listen or pay attention to.", simpleDefinition: "Not noticed or paid attention to" },
  "ill-will": { definition: "A feeling of hostility or dislike towards someone", simpleDefinition: "Bad feelings and hostility towards someone" },
  "imitation": { definition: "The act of imitating.", simpleDefinition: "A copy of something — not the real thing" },
  "immoral": { definition: "Not moral; inconsistent with rectitude, purity, or good morals; contrary to conscience or the divine law.", simpleDefinition: "Not following rules of right and wrong" },
  "immorality": { definition: "The state or quality of being immoral; vice.", simpleDefinition: "Behaviour that is wrong or against moral rules" },
  "implausible": { definition: "Not plausible; unlikely; dubious.", simpleDefinition: "Hard to believe; not very likely to be true" },
  "important": { definition: "Having relevant and crucial value.", simpleDefinition: "Mattering a great deal; having real significance" },
  "impossible": { definition: "Not possible; not able to be done or happen.", simpleDefinition: "Not able to happen or be done" },
  "impound": { definition: "To shut up or place in an enclosure called a pound", simpleDefinition: "To take and hold something officially" },
  "impoverished": { definition: "Reduced to poverty.", simpleDefinition: "Made very poor; lacking resources" },
  "impractical": { definition: "Not practical; impracticable", simpleDefinition: "Not sensible or possible to do in real life" },
  "imprecise": { definition: "Not precise or exact; containing some error or uncertainty", simpleDefinition: "Not exact or accurate; a bit vague" },
  "impressive": { definition: "Making, or tending to make, a positive impression; having power to impress", simpleDefinition: "Making a strong effect; very good or big" },
  "imprudent": { definition: "Not prudent; wanting in prudence or discretion; indiscreet; injudicious; not attentive to consequence; improper.", simpleDefinition: "Not thinking carefully before acting; unwise" },
  "impudent": { definition: "Not showing due respect; impertinent; bold-faced.", simpleDefinition: "Rude and disrespectful in a bold way" },
  "inactive": { definition: "Not active, temporarily or permanently.", simpleDefinition: "Not doing anything; not working" },
  "inattentive": { definition: "Of or pertaining to lack of attention; not paying attention; careless.", simpleDefinition: "Not paying attention; easily distracted" },
  "inconspicuous": { definition: "Not prominent nor easily noticeable", simpleDefinition: "Not easily noticed; blending into the background" },
  "increase": { definition: "A rise in amount, number or degree", simpleDefinition: "Getting bigger or more — going up" },
  "indefinite": { definition: "Without limit; forever, or until further notice; not definite.", simpleDefinition: "Not clearly defined or decided" },
  "indifferent": { definition: "Not caring or concerned about something; uninterested", simpleDefinition: "Just not bothered — doesn't care either way" },
  "individual": { definition: "Relating to a single person or thing as opposed to more than one.", simpleDefinition: "A single person; separate and distinct" },
  "industrious": { definition: "Hard-working and persistent.", simpleDefinition: "Working hard and steadily" },
  "ineffective": { definition: "Not having the desired effect; ineffectual", simpleDefinition: "Not producing the result you wanted" },
  "inert": { definition: "Unable to move or act; inanimate.", simpleDefinition: "Not moving; without energy or force" },
  "inform": { definition: "To instruct, train (usually in matters of knowledge).", simpleDefinition: "To tell someone about something" },
  "informed": { definition: "Instructed; having knowledge of a fact or area of education.", simpleDefinition: "Having the knowledge needed to make good decisions" },
  "infringement": { definition: "A violation or breach, as of a law.", simpleDefinition: "Breaking a rule or law" },
  "initiate": { definition: "Unpractised; untried; new.", simpleDefinition: "To cause something to begin" },
  "innate": { definition: "Inborn; existing or having existed since birth.", simpleDefinition: "Something you are born with — not learned" },
  "insane": { definition: "Exhibiting unsoundness or disorder of mind; not sane; mad", simpleDefinition: "Having a very serious mental illness; totally mad" },
  "insignificant": { definition: "Not important or noticeable; having little meaning or effect", simpleDefinition: "So small or unimportant it barely matters" },
  "instinctive": { definition: "Related to or prompted by instinct.", simpleDefinition: "Done naturally without thinking about it" },
  "insubordinate": { definition: "Rebellious or defiant to authority.", simpleDefinition: "Refusing to obey orders or rules" },
  "insufficiency": { definition: "The lack of sufficiency; a shortage or inadequacy.", simpleDefinition: "Not having enough of something" },
  "insufficient": { definition: "Not sufficient.", simpleDefinition: "Not enough to meet what is needed" },
  "integrity": { definition: "Steadfast adherence to a strict moral or ethical code.", simpleDefinition: "Being honest and sticking to strong moral principles" },
  "intensify": { definition: "To become or make more extreme, strong or forceful", simpleDefinition: "Getting stronger or more powerful" },
  "intensity": { definition: "The quality of being intense.", simpleDefinition: "Being very strong or extreme in degree" },
  "interested": { definition: "Having or showing interest.", simpleDefinition: "Wanting to know more about something" },
  "interesting": { definition: "Holding attention because it is unusual or exciting", simpleDefinition: "Holding your attention — worth knowing about" },
  "intermittent": { definition: "Stopping and starting, occuring, or presenting at intervals; coming after a particular time span.", simpleDefinition: "Stopping and starting — not continuous" },
  "intimidating": { definition: "Threatening", simpleDefinition: "Making you feel scared or less confident" },
  "invisible": { definition: "Not able to be seen; hidden from view", simpleDefinition: "Cannot be seen — completely hidden" },
  "irresolute": { definition: "Unable to make decisions; lacking in determination", simpleDefinition: "Unable to make up your mind" },
  "joint": { definition: "Done by two or more people or organisations working together.", simpleDefinition: "Done or shared by two or more people together" },
  "jolly": { definition: "Full of merriment and high spirits; jovial.", simpleDefinition: "Cheerful and good-humoured" },
  "joy": { definition: "A feeling of extreme happiness or cheerfulness, especially related to the acquisition or expectation of something good.", simpleDefinition: "A feeling of great happiness" },
  "joyful": { definition: "Feeling or causing joy.", simpleDefinition: "Feeling or causing great happiness" },
  "jubilant": { definition: "In a state of elation.", simpleDefinition: "Feeling or showing great happiness and triumph" },
  "judicious": { definition: "Having or showing good judgement; wise and sensible", simpleDefinition: "Showing very good and careful judgement" },
  "keen": { definition: "Having a strong interest in something; enthusiastic", simpleDefinition: "Very eager and enthusiastic about something" },
  "keep": { definition: "To have something and not give it away; to retain", simpleDefinition: "To hold onto something and not give it away" },
  "key": { definition: "Indispensable, supremely important.", simpleDefinition: "The most important part; essential" },
  "kind": { definition: "Having a friendly and caring nature; wanting to help others", simpleDefinition: "Caring and thoughtful — always ready to help" },
  "kindness": { definition: "The state of being kind.", simpleDefinition: "Being warm, generous and caring to others" },
  "laborious": { definition: "Requiring much physical effort; toilsome.", simpleDefinition: "Needing a lot of hard work and effort" },
  "lack": { definition: "The state of not having enough of something", simpleDefinition: "Not having enough — something is missing" },
  "lasting": { definition: "Persisting for an extended period of time.", simpleDefinition: "Continuing for a long time" },
  "late": { definition: "Near the end of a period of time.", simpleDefinition: "After the expected or usual time" },
  "lazy": { definition: "Unwilling to work or use effort", simpleDefinition: "Not wanting to work or make any effort" },
  "learner": { definition: "A person who is gaining knowledge or a skill", simpleDefinition: "Someone gaining knowledge or a new skill" },
  "leftover": { definition: "Something remaining after the rest has been used", simpleDefinition: "What is left when the rest has been used" },
  "legitimate": { definition: "Conforming to the law or rules; valid and genuine", simpleDefinition: "Proper and allowed — following the rules" },
  "lessen": { definition: "To make or become less; to reduce in size or degree", simpleDefinition: "Making something smaller or less strong" },
  "lifelike": { definition: "Like a living being, resembling life, giving an accurate representation", simpleDefinition: "Looking very much like the real thing" },
  "limit": { definition: "A point beyond which something cannot go", simpleDefinition: "The point beyond which you cannot go" },
  "listless": { definition: "Lacking energy or enthusiasm; not interested in anything", simpleDefinition: "No energy or interest — just going through the motions" },
  "lively": { definition: "Full of energy and enthusiasm; animated", simpleDefinition: "Buzzing with energy — fun and exciting" },
  "loath": { definition: "Averse, disinclined; reluctant, unwilling.", simpleDefinition: "Strongly unwilling to do something" },
  "long for": { definition: "To wish for something very much", simpleDefinition: "To really wish for something you don't have" },
  "looming": { definition: "To appear indistinctly, eg. when seen on the horizon or through the murk.", simpleDefinition: "About to happen — often something threatening" },
  "loss-making": { definition: "Producing a financial loss rather than a profit", simpleDefinition: "Not making money — running at a loss" },
  "low": { definition: "Below normal level; small in amount or degree", simpleDefinition: "Not very high; small in amount or quality" },
  "luxurious": { definition: "Very fine in quality and comfortable.", simpleDefinition: "Very comfortable and expensive" },
  "luxury": { definition: "Very expensive", simpleDefinition: "Something very expensive and comfortable — not essential" },
  "mad": { definition: "Insane; crazy, mentally deranged.", simpleDefinition: "Very angry; or having a mental illness" },
  "magnetic": { definition: "Of, relating to, operating by, or caused by magnetism.", simpleDefinition: "Having a charm that attracts people" },
  "magnificence": { definition: "Grandeur, brilliance, lavishness or splendor", simpleDefinition: "Impressive beauty and grandeur" },
  "majesty": { definition: "The quality of being impressive and great.", simpleDefinition: "Impressive stateliness and grandeur" },
  "major": { definition: "Important, serious or significant in scale", simpleDefinition: "Large, serious or very important" },
  "malevolence": { definition: "The wish to do evil to others; deep ill will", simpleDefinition: "A wish to do harm to other people" },
  "malevolent": { definition: "Having or showing a wish to do evil to others", simpleDefinition: "Wanting to hurt or harm other people — evil" },
  "malignant": { definition: "Very harmful in influence; intending evil", simpleDefinition: "Causing serious harm; very dangerous" },
  "master": { definition: "Masterful.", simpleDefinition: "To become very skilled at something" },
  "meanness": { definition: "The condition, or quality, of being mean (any of its definitions)", simpleDefinition: "Being unkind or ungenerous to others" },
  "meet": { definition: "To make contact (with) while in proximity.", simpleDefinition: "To come face to face with someone" },
  "melodious": { definition: "Having a pleasant tune; sweet-sounding", simpleDefinition: "Having a sweet and pleasant sound" },
  "merciful": { definition: "Showing mercy", simpleDefinition: "Showing kindness to those in your power" },
  "merit": { definition: "The quality of being good and deserving praise", simpleDefinition: "The quality of being good and deserving praise" },
  "merry": { definition: "Cheerful and lively; full of fun", simpleDefinition: "Very cheerful, happy and full of fun" },
  "mess": { definition: "To make untidy or dirty.", simpleDefinition: "A very untidy or confused state" },
  "mild": { definition: "Gentle and not severe, harsh or extreme", simpleDefinition: "Gentle and not too strong or harsh" },
  "mildness": { definition: "The quality of being gentle and not extreme", simpleDefinition: "Being gentle and not extreme or harsh" },
  "mindful": { definition: "Being aware (of something); attentive, heedful.", simpleDefinition: "Aware and thoughtful about what you are doing" },
  "minor": { definition: "Of little significance or importance.", simpleDefinition: "Small and not very important" },
  "miserable": { definition: "Very unhappy or uncomfortable; in a state of misery", simpleDefinition: "Really sad and fed up — feeling awful" },
  "misfortune": { definition: "Bad luck; an unfortunate event or situation", simpleDefinition: "Bad luck or an unfortunate event" },
  "mislead": { definition: "To cause someone to believe something that is not true", simpleDefinition: "To give someone wrong information on purpose" },
  "mock": { definition: "To make fun of someone in an unkind way", simpleDefinition: "To make fun of someone unkindly" },
  "modern": { definition: "Relating to the present time; new and up to date", simpleDefinition: "Up to date and belonging to the present" },
  "modest": { definition: "Not boastful about oneself or one's achievements", simpleDefinition: "Not showing off — happy to stay in the background" },
  "modesty": { definition: "The quality of being modest; having a limited and not overly high opinion of oneself and one's abilities.", simpleDefinition: "Not boasting about yourself or your abilities" },
  "money-making": { definition: "Profitable.", simpleDefinition: "Producing profit or financial gain" },
  "moral": { definition: "Of or relating to principles of right and wrong in behaviour, especially for teaching right behaviour.", simpleDefinition: "Following what is right and good" },
  "morality": { definition: "Recognition of the distinction between good and evil or between right and wrong; respect for and obedience to the rul...", simpleDefinition: "Principles about what is right and wrong" },
  "mourn": { definition: "To feel deep sadness at a loss or death", simpleDefinition: "To feel deep sadness about a loss" },
  "mused": { definition: "Thought about something in a careful, dreamy way", simpleDefinition: "Thought about something quietly and carefully" },
  "naive": { definition: "Lacking experience or wisdom; too ready to believe things", simpleDefinition: "Too trusting — believes things without questioning them" },
  "natural": { definition: "Existing in or caused by nature; not artificial", simpleDefinition: "Existing in nature — not made by people" },
  "necessary": { definition: "Required in order to achieve a result; essential", simpleDefinition: "Something you must have or do" },
  "negligent": { definition: "Failing to take proper care over something; careless", simpleDefinition: "Not looking after things properly — being careless" },
  "nervous": { definition: "Easily anxious or worried; feeling tense", simpleDefinition: "Feeling worried and a bit scared" },
  "neutral": { definition: "Not supporting either side; unbiased", simpleDefinition: "Not taking sides — treating all equally" },
  "new": { definition: "Not existing before; recently made or discovered", simpleDefinition: "Just made or discovered — not existing before" },
  "newcomer": { definition: "A person who has recently arrived in a place", simpleDefinition: "Someone who has just arrived somewhere" },
  "noble": { definition: "Having high moral qualities; of excellent character", simpleDefinition: "Having excellent moral character" },
  "noisy": { definition: "Making a lot of loud or unpleasant sound", simpleDefinition: "Making a lot of loud, unwanted sound" },
  "notable": { definition: "Worthy of note; remarkable; memorable; noted or distinguished.", simpleDefinition: "Worthy of attention; remarkable" },
  "noticeable": { definition: "Easily seen or noticed; obvious", simpleDefinition: "Easy to see and hard to ignore" },
  "notorious": { definition: "Famous for something bad; widely known for a negative reason", simpleDefinition: "Famous for something bad" },
  "objective": { definition: "Of or relating to a material object, actual existence or reality.", simpleDefinition: "Not influenced by personal feelings; fair" },
  "obscure": { definition: "Not well known; difficult to understand", simpleDefinition: "Not well known or hard to understand" },
  "observance": { definition: "The act of following a law, rule or custom", simpleDefinition: "Following a rule, custom or tradition" },
  "observant": { definition: "Quick to notice things; paying close attention", simpleDefinition: "Noticing details that others might miss" },
  "obvious": { definition: "Easy to see or understand; clear and plain", simpleDefinition: "Very easy to see or understand" },
  "occasional": { definition: "Happening sometimes but not regularly", simpleDefinition: "Happening sometimes but not very often" },
  "offended": { definition: "Feeling hurt or upset by something said or done", simpleDefinition: "Feeling hurt by something said or done" },
  "old-fashioned": { definition: "No longer current or modern; belonging to an earlier time", simpleDefinition: "Out of date — from an earlier time" },
  "ominous": { definition: "Suggesting something bad is going to happen", simpleDefinition: "A scary feeling that something bad is about to happen" },
  "open": { definition: "Honest and willing to share thoughts; not secretive", simpleDefinition: "Honest and not keeping secrets" },
  "open-minded": { definition: "Willing to consider new ideas and opinions", simpleDefinition: "Happy to consider new ideas and opinions" },
  "opposed": { definition: "Against something; in disagreement with", simpleDefinition: "Strongly against something" },
  "opulent": { definition: "Ostentatiously rich and luxurious", simpleDefinition: "Very rich and luxurious" },
  "order": { definition: "A tidy and organised state; a command", simpleDefinition: "A tidy, organised state; a command" },
  "ordered": { definition: "Neatly arranged; following a logical sequence", simpleDefinition: "Neat and arranged in a logical way" },
  "ordinary": { definition: "With no special features; normal and unremarkable", simpleDefinition: "Just normal — nothing special about it" },
  "organisation": { definition: "The action of organising things into a structured whole", simpleDefinition: "Arranging things neatly and efficiently" },
  "original": { definition: "Relating to the origin or beginning; preceding all others", simpleDefinition: "Not copied — the first or earliest version" },
  "ostentatious": { definition: "Of ostentation.", simpleDefinition: "Showing off wealth or ability to impress others" },
  "outraged": { definition: "Feeling or showing anger about something unjust", simpleDefinition: "Feeling very angry about something unjust" },
  "outstanding": { definition: "Exceptionally good; clearly better than others", simpleDefinition: "Exceptionally good — way above average" },
  "overdue": { definition: "Not done or happening when expected; late", simpleDefinition: "Later than expected — should have happened already" },
  "overjoyed": { definition: "Extremely happy and pleased", simpleDefinition: "Extremely happy and delighted" },
  "overlooked": { definition: "Failed to notice or consider; missed", simpleDefinition: "Not noticed or not given proper attention" },
  "painstaking": { definition: "Done with very careful and thorough attention", simpleDefinition: "Done with very careful and thorough effort" },
  "pale": { definition: "Light in colour; lacking the usual brightness", simpleDefinition: "Light in colour; lacking brightness" },
  "partial": { definition: "Favouring one side over another; biased", simpleDefinition: "Favouring one side; biased" },
  "passable": { definition: "That may be passed or traversed.", simpleDefinition: "Just good enough — acceptable but not brilliant" },
  "passionate": { definition: "Having or showing strong feelings or beliefs", simpleDefinition: "Really caring deeply about something" },
  "past": { definition: "Gone by in time; having happened before now", simpleDefinition: "Already gone — happened before now" },
  "pause": { definition: "A temporary stop in action or speech", simpleDefinition: "A short stop before carrying on" },
  "peace": { definition: "Freedom from war or conflict; a state of calm", simpleDefinition: "Freedom from conflict; a calm state" },
  "peaceful": { definition: "Free from disturbance; quiet and tranquil", simpleDefinition: "Calm and quiet — no fighting or trouble" },
  "peaceful person": { definition: "Someone who avoids conflict and seeks harmony", simpleDefinition: "Someone who always tries to avoid arguments" },
  "peacemaker": { definition: "A person who works to end conflict between others", simpleDefinition: "Someone who works to stop arguments and conflict" },
  "penniless": { definition: "Having no money at all; very poor", simpleDefinition: "Having no money at all" },
  "perceptive": { definition: "Having or showing keenness of perception, insight, understanding, or intuition.", simpleDefinition: "Quick to notice and understand things" },
  "perfect": { definition: "Having no faults or defects; completely without flaws", simpleDefinition: "Without any faults — completely right" },
  "peripheral": { definition: "Not central or important; on the edge or outside", simpleDefinition: "Not the main focus — on the edge" },
  "permanent": { definition: "Lasting for a long time or for ever; not temporary", simpleDefinition: "Lasting for ever or a very long time" },
  "persist": { definition: "To continue doing something despite difficulty", simpleDefinition: "To keep going despite difficulty" },
  "persistence": { definition: "The quality of continuing despite obstacles", simpleDefinition: "Continuing to try even when it is hard" },
  "persistent": { definition: "Continuing firmly despite difficulty or opposition", simpleDefinition: "Refusing to give up — keeps on going" },
  "petty": { definition: "Small and unimportant; overly concerned with minor things", simpleDefinition: "Small-minded and concerned with unimportant things" },
  "philanthropic": { definition: "Of or pertaining to philanthropy; characterized by philanthropy; loving or helping mankind", simpleDefinition: "Generous in helping others and giving to charity" },
  "picturesque": { definition: "Attractively unusual or charming in appearance", simpleDefinition: "Very pretty and charming to look at" },
  "pigheaded": { definition: "Stubbornly refusing to change one's opinion", simpleDefinition: "Stubbornly refusing to listen to other views" },
  "pine for": { definition: "To feel a strong longing for something", simpleDefinition: "To miss something or someone a great deal" },
  "pitiful": { definition: "Deserving or causing feelings of pity; very poor quality", simpleDefinition: "So bad or sad it deserves pity" },
  "plain": { definition: "Simple and without decoration; easy to understand", simpleDefinition: "Simple and ordinary — no decoration" },
  "pleasant": { definition: "Giving a sense of happiness or enjoyment; agreeable", simpleDefinition: "Nice and enjoyable — makes you feel good" },
  "pleased": { definition: "Feeling happy and satisfied about something", simpleDefinition: "Happy and satisfied about something" },
  "pleasure": { definition: "A feeling of happiness and enjoyment", simpleDefinition: "A good feeling of happiness and enjoyment" },
  "plentiful": { definition: "Existing in large number or ample amount.", simpleDefinition: "Available in large amounts — more than enough" },
  "plenty": { definition: "A large or sufficient amount; more than enough", simpleDefinition: "Loads of something — way more than you need" },
  "plunge": { definition: "To fall or jump suddenly downward", simpleDefinition: "To fall suddenly downward" },
  "pointless": { definition: "Having no purpose or use; achieving nothing", simpleDefinition: "No purpose — absolutely nothing achieved" },
  "polite": { definition: "Having good manners and being respectful to others", simpleDefinition: "Well-mannered and respectful to others" },
  "pondered": { definition: "Thought carefully and thoroughly about something", simpleDefinition: "Thought very carefully about something" },
  "poor": { definition: "Lacking money; of low quality or below standard", simpleDefinition: "Not having enough money; below standard" },
  "position": { definition: "A place where someone or something is located", simpleDefinition: "The place where someone or something is" },
  "possible": { definition: "Able to be done or achieved; not impossible", simpleDefinition: "Able to be done — not impossible" },
  "poverty-stricken": { definition: "Suffering from extreme poverty and lack of money", simpleDefinition: "Suffering from extreme lack of money" },
  "powerful": { definition: "Having, or capable of exerting power, potency or influence.", simpleDefinition: "Having great strength, force or influence" },
  "practicable": { definition: "Able to be done or put into practice successfully", simpleDefinition: "Possible to actually put into practice" },
  "praise": { definition: "To express warm approval or admiration of someone", simpleDefinition: "To say good things about someone's work" },
  "praised": { definition: "Spoken of with warmth and approval", simpleDefinition: "Given warm approval for doing well" },
  "precise": { definition: "Exact and accurate in every detail", simpleDefinition: "Exactly right — no room for error" },
  "predicament": { definition: "A difficult or unpleasant situation", simpleDefinition: "A difficult and unpleasant situation" },
  "predictable": { definition: "Able to be known in advance; behaving in an expected way", simpleDefinition: "Easy to know in advance — no surprises" },
  "prejudiced": { definition: "Having prejudices.", simpleDefinition: "Having unfair opinions formed without knowing the facts" },
  "present-day": { definition: "Existing or happening in the current period of time", simpleDefinition: "Happening right now in today's world" },
  "preserving": { definition: "Keeping something safe from harm or decay", simpleDefinition: "Keeping something safe from damage or decay" },
  "press on": { definition: "To continue doing something despite difficulty", simpleDefinition: "To keep going even when things are difficult" },
  "pristine": { definition: "In perfect condition; clean and unspoiled", simpleDefinition: "In perfect, clean condition" },
  "proactive": { definition: "Taking action to deal with problems before they arise", simpleDefinition: "Acting before problems arise instead of after" },
  "professional": { definition: "Relating to a skilled paid job; competent and reliable", simpleDefinition: "Skilled, competent and reliable" },
  "profitable": { definition: "Producing financial gain; beneficial and worthwhile", simpleDefinition: "Making money; worth doing" },
  "profusion": { definition: "Abundance; the state of being profuse; a cornucopia", simpleDefinition: "A large amount of something — in great abundance" },
  "prompt": { definition: "Done without delay; quick to act when needed", simpleDefinition: "Quick to act; happening without delay" },
  "prosperous": { definition: "Having success, wealth and good fortune", simpleDefinition: "Doing well financially and in general" },
  "protective": { definition: "Intended to keep someone or something safe from harm", simpleDefinition: "Keeping people or things safe from harm" },
  "proud": { definition: "Feeling deep satisfaction from one's achievements", simpleDefinition: "Feeling pleased about your own achievements" },
  "punctual": { definition: "Arriving or doing things at the agreed time", simpleDefinition: "Always on time — never late" },
  "punished": { definition: "Made to suffer a penalty for doing something wrong", simpleDefinition: "Made to suffer as a result of doing wrong" },
  "puzzle": { definition: "To cause someone to feel confused and uncertain", simpleDefinition: "To make someone confused and unsure" },
  "puzzled": { definition: "Unable to understand something; confused and uncertain", simpleDefinition: "Can't figure it out — something doesn't make sense" },
  "query": { definition: "To ask a question.", simpleDefinition: "A question or doubt about something" },
  "question": { definition: "To express doubt about the truth of something", simpleDefinition: "To express doubt or ask for an explanation" },
  "questioning": { definition: "Showing doubt or curiosity; asking for explanation", simpleDefinition: "Not sure — asking for reasons or proof" },
  "quiet": { definition: "Making very little noise; calm and peaceful", simpleDefinition: "Not making much noise; peaceful" },
  "quit": { definition: "To stop doing something; to leave a job or place", simpleDefinition: "To stop doing something or leave" },
  "radiant": { definition: "Sending out light or warmth; showing great joy", simpleDefinition: "Shining with light or happiness" },
  "rational": { definition: "Based on clear thinking and good judgement; logical", simpleDefinition: "Based on clear, logical thinking" },
  "real": { definition: "Actually existing; not imagined or pretend", simpleDefinition: "Actually existing — not imagined or fake" },
  "reasonable": { definition: "Based on good sense; fair and sensible", simpleDefinition: "Fair and sensible — based on good sense" },
  "reasoned": { definition: "Based on careful logical thought", simpleDefinition: "Based on careful, logical thinking" },
  "reassuring": { definition: "Removing doubts or fears; making someone feel safe", simpleDefinition: "Making you feel less worried and more safe" },
  "rebuke": { definition: "To express sharp disapproval of someone", simpleDefinition: "To tell someone off sharply" },
  "rebuked": { definition: "Told off sharply for doing something wrong", simpleDefinition: "Told off firmly for doing wrong" },
  "recall": { definition: "To bring back to mind; to summon someone back", simpleDefinition: "To bring something back to mind" },
  "reckless": { definition: "Acting without thinking about the consequences; heedless of danger", simpleDefinition: "Rushing in without thinking — ignoring the danger" },
  "reduce": { definition: "To make something smaller or less in size or amount", simpleDefinition: "Making something smaller or cutting it down" },
  "reflected on": { definition: "Thought carefully about something in the past", simpleDefinition: "Spent time carefully thinking about something" },
  "reflective": { definition: "Thinking carefully and deeply about something", simpleDefinition: "Thinking carefully and deeply" },
  "rejoice": { definition: "To be very happy, be delighted, exult; to feel joy.", simpleDefinition: "To feel or show great happiness" },
  "rejoinder": { definition: "A quick or witty reply to a comment", simpleDefinition: "A quick, clever reply to a comment" },
  "relaxed": { definition: "Free from tension or anxiety; calm", simpleDefinition: "Calm and free from tension" },
  "relentless": { definition: "Unceasingly intense; never giving up", simpleDefinition: "Never stopping or giving up" },
  "relentlessness": { definition: "The quality of never stopping or giving up", simpleDefinition: "Never-ending determination to carry on" },
  "reliability": { definition: "The quality of being consistently trustworthy", simpleDefinition: "Being dependable — doing what you say you will" },
  "relief": { definition: "A feeling of reassurance when anxiety or distress is removed", simpleDefinition: "That good feeling when something scary is over" },
  "relieve": { definition: "To make pain or distress less severe", simpleDefinition: "To make pain or worry less severe" },
  "relinquish": { definition: "To give up or surrender something", simpleDefinition: "To give up something you had" },
  "remainder": { definition: "Remaining.", simpleDefinition: "The part that is left over after the rest is gone" },
  "remains": { definition: "What is left after other parts have been removed", simpleDefinition: "What is left behind after the rest is gone" },
  "remarkable": { definition: "Worthy of attention; striking and extraordinary", simpleDefinition: "Worth noticing — really impressive" },
  "remote": { definition: "Far away in distance; unlikely or distant", simpleDefinition: "Far away; unlikely to happen" },
  "renounce": { definition: "To give up or abandon a belief or claim", simpleDefinition: "To formally give up a belief or claim" },
  "renovated": { definition: "Restored to good condition; repaired and updated", simpleDefinition: "Fixed up and made good as new" },
  "renowned": { definition: "Known and admired by many people; famous", simpleDefinition: "Famous and admired by many people" },
  "repetitive": { definition: "Doing the same thing over and over again", simpleDefinition: "Doing the same thing over and over" },
  "reply": { definition: "To give a written or spoken response, especially to a question, request, accusation or criticism; to answer.", simpleDefinition: "An answer or response to something" },
  "reprimanded": { definition: "Formally told off for doing something wrong", simpleDefinition: "Officially told off for bad behaviour" },
  "reproof": { definition: "A spoken or written expression of disapproval", simpleDefinition: "A formal statement of disapproval" },
  "repulsive": { definition: "Tending to rouse aversion or to repulse", simpleDefinition: "Causing a strong feeling of disgust" },
  "reputable": { definition: "Having a good reputation; respected and trusted", simpleDefinition: "Well thought of — has a good reputation" },
  "reputation": { definition: "The beliefs others hold about a person's character", simpleDefinition: "What other people think of your character" },
  "resolute": { definition: "Firm, unyielding, determined.", simpleDefinition: "Determined and firm — not giving up" },
  "respect": { definition: "To have respect for.", simpleDefinition: "To treat someone with high regard" },
  "respected": { definition: "Deserving of respect; due special honor or appreciation.", simpleDefinition: "Admired and thought well of by others" },
  "respectful": { definition: "Marked or characterized by respect", simpleDefinition: "Showing care and consideration for others" },
  "rest": { definition: "Relief from work or activity by sleeping; sleep.", simpleDefinition: "To stop working and relax" },
  "restore": { definition: "To bring back to an original condition", simpleDefinition: "To bring something back to how it was" },
  "restrained": { definition: "Kept under control; not excessive or showy", simpleDefinition: "Holding back — calm and controlled, not over the top" },
  "restrict": { definition: "To limit or keep within certain boundaries", simpleDefinition: "To keep something within limits" },
  "retain": { definition: "To keep possession of something; not give it up", simpleDefinition: "To keep hold of something" },
  "retreat": { definition: "To withdraw from a position, go back.", simpleDefinition: "To move back away from danger" },
  "return": { definition: "To come or go back to a previous place or state", simpleDefinition: "To go or come back" },
  "reveal": { definition: "To uncover; to show and display that which was hidden.", simpleDefinition: "To show or make known something hidden" },
  "reward": { definition: "Something of value given in return for an act.", simpleDefinition: "Something given for good work or behaviour" },
  "rewarded": { definition: "To give a reward to or for.", simpleDefinition: "Given something good in return for effort" },
  "rewarding": { definition: "Giving or resulting in reward or satisfaction.", simpleDefinition: "Giving a good feeling of satisfaction" },
  "righteous": { definition: "Morally right and good; virtuous and just", simpleDefinition: "Morally right and good" },
  "rigid": { definition: "Unable to bend; not flexible or willing to change", simpleDefinition: "Stiff and not able to bend or change" },
  "riposte": { definition: "A quick and clever reply to a remark", simpleDefinition: "A quick and clever reply" },
  "rise": { definition: "To move upward; to increase in level or amount", simpleDefinition: "Going up — moving to a higher level" },
  "risky": { definition: "Involving the possibility of danger or failure", simpleDefinition: "Involving possible danger or failure" },
  "rowdy": { definition: "Loud and disorderly; riotous; boisterous.", simpleDefinition: "Noisy and disorderly; causing a disturbance" },
  "rude": { definition: "Bad-mannered.", simpleDefinition: "Not polite; behaving in an offensive way" },
  "rundown": { definition: "Tired and exhausted.", simpleDefinition: "In poor condition from lack of care" },
  "sad": { definition: "Emotionally negative.", simpleDefinition: "Feeling unhappy or sorrowful" },
  "safe": { definition: "Protected from danger or harm; not risky", simpleDefinition: "Protected from danger — no risk" },
  "sane": { definition: "Having a healthy mind; sensible and reasonable", simpleDefinition: "Having a healthy mind; making sense" },
  "satisfied": { definition: "Pleased because one's needs or wishes are met", simpleDefinition: "Happy because what you wanted has happened" },
  "savage": { definition: "Fierce and violent; showing no mercy", simpleDefinition: "Very fierce and violent — no mercy" },
  "savagery": { definition: "Savage or brutal behaviour; barbarity.", simpleDefinition: "Extreme cruelty and violent behaviour" },
  "scaling": { definition: "To change the size of something whilst maintaining proportion; especially to change a process in order to produce muc...", simpleDefinition: "Climbing up something" },
  "scandalous": { definition: "Wrong, immoral, causing a scandal", simpleDefinition: "Causing outrage by being shockingly wrong" },
  "scarce": { definition: "Uncommon, rare; difficult to find; insufficient to meet a demand.", simpleDefinition: "In very short supply — hard to find" },
  "scolded": { definition: "Told off angrily for doing something wrong", simpleDefinition: "Told off crossly for doing something wrong" },
  "scolding": { definition: "An angry telling-off for bad behaviour", simpleDefinition: "An angry telling-off" },
  "secretive": { definition: "Tending to hide feelings and intentions from others", simpleDefinition: "Keeping things hidden from others" },
  "secure": { definition: "Fixed and not likely to move; free from danger", simpleDefinition: "Safe and firmly in place" },
  "seize": { definition: "To take hold of something suddenly and forcibly", simpleDefinition: "To grab something suddenly and firmly" },
  "self-effacing": { definition: "Shy, extremely humble and modest; making oneself seem unnoticeable.", simpleDefinition: "Not drawing attention to yourself; modest" },
  "self-important": { definition: "Having, or behaving as if having, too high an opinion of one's own importance.", simpleDefinition: "Thinking you are more important than you really are" },
  "selfish": { definition: "Holding one's own self-interest as the standard for decision making.", simpleDefinition: "Only caring about yourself — not thinking of others" },
  "sensible": { definition: "Having good judgement; practical and reasonable", simpleDefinition: "Making good, practical decisions — not silly" },
  "serious": { definition: "Without humor or expression of happiness; grave in manner or disposition", simpleDefinition: "Solemn and thoughtful; not joking around" },
  "severe": { definition: "Very extreme or harsh; causing suffering", simpleDefinition: "Very harsh or extreme" },
  "shameless": { definition: "Feeling no shame about bad behaviour; brazen", simpleDefinition: "Not feeling any shame about bad behaviour" },
  "sharp": { definition: "Having a thin cutting edge; quick and intelligent", simpleDefinition: "Having a fine cutting edge; quick-thinking" },
  "shining": { definition: "Emitting light.", simpleDefinition: "Giving out bright light; excellent" },
  "shocked": { definition: "Surprised, startled, confused, or taken aback.", simpleDefinition: "Feeling sudden surprise and upset" },
  "short-lived": { definition: "Lasting only a short time", simpleDefinition: "Not lasting very long" },
  "shortage": { definition: "A lack or deficiency; not enough of something", simpleDefinition: "When there isn't enough of something" },
  "showy": { definition: "calling attention; flashy; standing out to the eye", simpleDefinition: "Attracting attention with display — perhaps too much" },
  "shrivel": { definition: "To collapse inward; to crumble.", simpleDefinition: "To become smaller and wrinkled; to wither" },
  "shy": { definition: "Nervous or uncomfortable around other people", simpleDefinition: "Nervous around other people; not confident" },
  "significant": { definition: "Signifying something; carrying meaning.", simpleDefinition: "Important enough to be noticed or have an effect" },
  "silly": { definition: "Laughable or amusing through foolishness or a foolish appearance.", simpleDefinition: "Not sensible; foolish and childish" },
  "simple": { definition: "Easily understood or done; not complicated", simpleDefinition: "Easy to understand — no complicated bits" },
  "simplicity": { definition: "The state or quality of being simple", simpleDefinition: "The quality of being simple and easy to understand" },
  "simultaneous": { definition: "Happening at the same time", simpleDefinition: "Happening at exactly the same time" },
  "sinful": { definition: "Constituting a sin; being morally or religiously wrong; wicked; evil", simpleDefinition: "Wicked and going against moral or religious rules" },
  "sinister": { definition: "Suggesting evil or harm; giving a sense of danger", simpleDefinition: "Creepy and evil-feeling — something bad is going on" },
  "sloppy": { definition: "Careless and untidy; not thorough", simpleDefinition: "Careless and untidy — not thorough" },
  "slothful": { definition: "Lazy and unwilling to work or make effort", simpleDefinition: "Very lazy — not wanting to do anything" },
  "slow": { definition: "Taking a long time to move or go a short distance, or to perform an action; not quick in motion; proceeding at a low ...", simpleDefinition: "Not moving or working quickly" },
  "sluggish": { definition: "Slow-moving and lacking energy", simpleDefinition: "Slow and lacking energy" },
  "smug": { definition: "Irritatingly pleased with oneself, offensively self-complacent, self-satisfied.", simpleDefinition: "Too pleased with yourself in an irritating way" },
  "soar": { definition: "To fly high with little effort, like a bird.", simpleDefinition: "To fly up high; to rise quickly" },
  "solid": { definition: "That can be picked up or held, having a texture, and usually firm. Unlike a liquid or a gas.", simpleDefinition: "Firm and strong; dependable and reliable" },
  "solo": { definition: "Without a companion or instructor.", simpleDefinition: "Done by one person alone" },
  "solution": { definition: "A way of solving a problem", simpleDefinition: "The answer to a problem" },
  "sorrowful": { definition: "exhibiting sorrow; dejected; distraught.", simpleDefinition: "Feeling or showing deep sadness" },
  "sparing": { definition: "Prudent and restrained in the use of resources; careful, economical or frugal.", simpleDefinition: "Using as little as possible; economical" },
  "sparse": { definition: "Thinly spread and not dense; in short supply", simpleDefinition: "Thin and spread out — not very much of it" },
  "specific": { definition: "Clearly defined and precise; not general", simpleDefinition: "Clearly stated and exact — not vague" },
  "spite": { definition: "To treat maliciously; to try to injure or thwart.", simpleDefinition: "A desire to hurt or annoy someone" },
  "splendour": { definition: "Great light, luster or brilliance.", simpleDefinition: "Magnificent and impressive beauty" },
  "split": { definition: "Divided.", simpleDefinition: "To divide into separate parts" },
  "spontaneous": { definition: "Self-generated; happening without any apparent external cause.", simpleDefinition: "Done without planning — natural and unforced" },
  "sporadic": { definition: "occurring in isolated instances; not epidemic.", simpleDefinition: "Happening occasionally and irregularly" },
  "stable": { definition: "Not likely to change or fail; firmly established", simpleDefinition: "Steady and solid — not going to fall or change suddenly" },
  "start": { definition: "To begin doing something; to set in motion", simpleDefinition: "To begin something" },
  "starving": { definition: "Suffering from extreme hunger", simpleDefinition: "Extremely hungry" },
  "station": { definition: "To place someone in a particular position", simpleDefinition: "To place someone in a position" },
  "steady": { definition: "Firm in standing or position; not tottering or shaking; fixed; firm.", simpleDefinition: "Firm and not likely to move or change" },
  "stimulating": { definition: "Making someone feel interested and enthusiastic", simpleDefinition: "Making you feel excited and interested" },
  "stormy": { definition: "Of or pertaining to storms.", simpleDefinition: "Full of strong wind and rain; full of anger" },
  "strength": { definition: "To give strength to; to strengthen.", simpleDefinition: "The quality of being physically or mentally powerful" },
  "strict": { definition: "Demanding that rules are obeyed closely", simpleDefinition: "Making sure rules are always followed" },
  "striking": { definition: "Making a strong impression.", simpleDefinition: "Very noticeable or impressive — makes you look twice" },
  "strong": { definition: "Having great power or force; not easily broken", simpleDefinition: "Having great power or force" },
  "struggle": { definition: "To strive, to labour in difficulty, to fight (for or against), to contend.", simpleDefinition: "To try hard to do something difficult" },
  "stubborn": { definition: "Refusing to move or to change one's opinion; obstinate; firmly resisting; persistent in doing something.", simpleDefinition: "Refusing to change your mind or give up" },
  "stunned": { definition: "So shocked that one cannot react", simpleDefinition: "So shocked you can't react" },
  "subdued": { definition: "Conquered; overpowered; crushed; submissive.", simpleDefinition: "Quiet and lacking energy — holding feelings back" },
  "submissive": { definition: "Meekly obedient or passive.", simpleDefinition: "Ready to give in to others; obedient" },
  "subside": { definition: "To sink or fall to the bottom; to settle, as lees.", simpleDefinition: "To become less strong or severe" },
  "subtle": { definition: "Hard to grasp; not obvious or easily understood; barely noticeable.", simpleDefinition: "Not obvious — hard to notice without care" },
  "succeed": { definition: "To achieve the desired aim or result", simpleDefinition: "To achieve what you set out to do" },
  "successful": { definition: "Having achieved what one set out to do", simpleDefinition: "Having achieved your goal" },
  "suffer": { definition: "To undergo hardship.", simpleDefinition: "To feel pain, sadness or difficulty" },
  "suffering": { definition: "The state of undergoing pain, distress or hardship", simpleDefinition: "Feeling a lot of pain or sadness" },
  "sullen": { definition: "Having a brooding ill temper; sulky.", simpleDefinition: "Bad-tempered and silent; sulky" },
  "sunny": { definition: "Featuring a lot of sunshine.", simpleDefinition: "Bright with sunlight; cheerful and happy" },
  "superficial": { definition: "Of or pertaining to the surface.", simpleDefinition: "Only on the surface — not deep or serious" },
  "support": { definition: "To keep from falling.", simpleDefinition: "To help or encourage someone" },
  "surly": { definition: "Bad-tempered and unfriendly in manner", simpleDefinition: "Rude and bad-tempered" },
  "surplus": { definition: "An amount left over when requirements have been met", simpleDefinition: "Extra left over after you've used what you need" },
  "surrender": { definition: "To give up and admit defeat", simpleDefinition: "To give up and admit defeat" },
  "tall": { definition: "Of greater than average height", simpleDefinition: "Taller than average in height" },
  "tame": { definition: "Not or no longer wild; domesticated", simpleDefinition: "Not wild; trained to live with people" },
  "taxing": { definition: "Very demanding on one's resources or patience", simpleDefinition: "Very demanding and tiring" },
  "tedious": { definition: "Boring, monotonous, time-consuming, wearisome.", simpleDefinition: "Long and dull — makes time drag" },
  "temporary": { definition: "Not permanent; existing only for a period or periods of time.", simpleDefinition: "Lasting for only a short time" },
  "tenderness": { definition: "A tendency to express warm, compassionate feelings", simpleDefinition: "Gentleness and warmth towards others" },
  "thorough": { definition: "Done with great care and attention to every detail", simpleDefinition: "Doing something with great care and attention" },
  "thoughtful": { definition: "Demonstrating thought or careful consideration.", simpleDefinition: "Thinking carefully; showing kindness to others" },
  "threatening": { definition: "Suggesting danger is coming; intimidating", simpleDefinition: "Making you feel scared — like danger is coming" },
  "thrifty": { definition: "Using money and resources carefully; not wasteful", simpleDefinition: "Careful not to waste money or resources" },
  "thrilled": { definition: "Extremely excited or delighted.", simpleDefinition: "Feeling very excited and pleased" },
  "thrive": { definition: "To grow vigorously and do well; to flourish", simpleDefinition: "Growing really well and doing brilliantly" },
  "thug": { definition: "To commit acts of thuggery, to live the life of a thug, or to dress and act in a manner reminiscent of someone who does.", simpleDefinition: "A violent and brutal person" },
  "tidiness": { definition: "The quality of being neat and well-organised", simpleDefinition: "Being neat and well-organised" },
  "timely": { definition: "Done at the proper time or within the proper time limits; prompt.", simpleDefinition: "Happening at just the right moment" },
  "timid": { definition: "Lacking courage or confidence; easily frightened", simpleDefinition: "Easily frightened — not confident" },
  "tired": { definition: "In need of some rest or sleep.", simpleDefinition: "Needing rest; lacking energy" },
  "tolerant": { definition: "Tending to permit, allow, understand, or accept something", simpleDefinition: "Accepting people and ideas that are different" },
  "tolerate": { definition: "To allow or accept something one dislikes", simpleDefinition: "To accept something even if you don't like it" },
  "torment": { definition: "To cause severe suffering to (stronger than to vex but weaker than to torture.)", simpleDefinition: "Severe physical or mental suffering" },
  "torrent": { definition: "Rolling or rushing in a rapid stream.", simpleDefinition: "A fast-moving, powerful stream of water" },
  "toughness": { definition: "The state of being tough", simpleDefinition: "The ability to cope with difficulty without giving up" },
  "trace": { definition: "An act of tracing.", simpleDefinition: "A very small amount; a mark left behind" },
  "tragedy": { definition: "An event causing great suffering and sadness", simpleDefinition: "A very sad event that causes great suffering" },
  "tranquil": { definition: "Free from emotional or mental disturbance.", simpleDefinition: "Calm, peaceful and free from trouble" },
  "trauma": { definition: "A deeply distressing experience that causes lasting harm", simpleDefinition: "A deeply upsetting experience that causes lasting harm" },
  "treacherous": { definition: "Likely to betray trust; dangerous and untrustworthy", simpleDefinition: "Not to be trusted — likely to betray you" },
  "trial": { definition: "Pertaining to a trial or test.", simpleDefinition: "A test of something; a difficult experience" },
  "trick": { definition: "Involving trickery or deception.", simpleDefinition: "To deceive someone into believing something false" },
  "trickle": { definition: "To pour a liquid in a very thin stream, or so that drops fall continuously.", simpleDefinition: "A small, slow flow of liquid" },
  "troubled": { definition: "Anxious, worried, careworn.", simpleDefinition: "Feeling worried or upset; full of problems" },
  "trusting": { definition: "Ready to believe in the honesty of others", simpleDefinition: "Ready to believe others are honest" },
  "trustworthiness": { definition: "The quality of being reliable and honest", simpleDefinition: "Being reliable and honest" },
  "ugly": { definition: "Unpleasant to look at; morally offensive", simpleDefinition: "Not pleasant to look at" },
  "unachievable": { definition: "That cannot be achieved (or only with great difficulty)", simpleDefinition: "Not possible to accomplish or reach" },
  "unaware": { definition: "Not aware or informed; lacking knowledge.", simpleDefinition: "Not knowing about something that is happening" },
  "unbalanced": { definition: "Not balanced, without equilibrium; dizzy", simpleDefinition: "Not steady; unfair or biased" },
  "unbiased": { definition: "Showing no unfair preference; treating all equally", simpleDefinition: "Treating everyone fairly — no favourites" },
  "uncertain": { definition: "Not certain; unsure.", simpleDefinition: "Not sure; not definitely known" },
  "uncertainty": { definition: "Doubt; the condition of being uncertain or without conviction.", simpleDefinition: "A feeling of not knowing what will happen" },
  "unclear": { definition: "Ambiguous; liable to more than one interpretation.", simpleDefinition: "Not easy to understand; not definite" },
  "unconvinced": { definition: "Not persuaded that something is true", simpleDefinition: "Not persuaded — still not sure" },
  "unconvincing": { definition: "Failing to make someone believe something", simpleDefinition: "Failing to make you believe something" },
  "uncoordinated": { definition: "Not coordinated or properly planned", simpleDefinition: "Not working together smoothly; clumsy" },
  "understanding": { definition: "Sympathetically aware of other people's feelings", simpleDefinition: "Sympathetic and aware of others' feelings" },
  "understated": { definition: "Restrained and unpretentious.", simpleDefinition: "Presented in a very quiet, low-key way" },
  "undivided": { definition: "Given completely without distraction; whole", simpleDefinition: "Complete and whole — not split at all" },
  "uneasy": { definition: "Not easy; difficult.", simpleDefinition: "Slightly worried or uncomfortable" },
  "unending": { definition: "Not ending; having no end.", simpleDefinition: "Going on forever — with no sign of stopping" },
  "unfair": { definition: "Not beautiful; uncomely; unattractive", simpleDefinition: "Not treating everyone equally; unjust" },
  "unfamiliar": { definition: "Not known or recognised; not previously encountered", simpleDefinition: "Not known before — never seen or heard" },
  "unfortunate": { definition: "Not favored by fortune", simpleDefinition: "Unlucky; happening at a bad time" },
  "unfriendly": { definition: "Not welcoming or kind; cold and hostile in manner", simpleDefinition: "Cold and unwelcoming — doesn't want to be your friend" },
  "unhappy": { definition: "Not feeling pleased or content; sad", simpleDefinition: "Not content or pleased — sad" },
  "unimportant": { definition: "Not significant or worthy of attention; trivial", simpleDefinition: "Doesn't really matter — not worth worrying about" },
  "uninterested": { definition: "Unmotivated by personal interest; unbiased, disinterested.", simpleDefinition: "Not curious or bothered about something" },
  "united": { definition: "Joined into a single entity.", simpleDefinition: "Working together as one; in agreement" },
  "unkind": { definition: "Not considerate or caring; somewhat cruel", simpleDefinition: "Not caring or considerate — a bit cruel" },
  "unknown": { definition: "Not known or familiar; not identified", simpleDefinition: "Not recognised — never heard of before" },
  "unlikely": { definition: "Not likely; improbable; not to be reasonably expected.", simpleDefinition: "Not probable — probably won't happen" },
  "unnecessary": { definition: "Not needed or necessary.", simpleDefinition: "Not needed — you can do without it" },
  "unpleasant": { definition: "Not pleasant.", simpleDefinition: "Not nice — causing discomfort or upset" },
  "unpredictable": { definition: "Not able to be known in advance; changeable", simpleDefinition: "Hard to know what will happen — keeps changing" },
  "unprofitable": { definition: "Not making a profit", simpleDefinition: "Not making any money; not worth doing" },
  "unreliability": { definition: "The quality of being unreliable.", simpleDefinition: "Not being dependable or consistent" },
  "unremarkable": { definition: "Not particularly interesting or special; ordinary", simpleDefinition: "Ordinary — nothing special about it" },
  "unstable": { definition: "Likely to change or collapse; not firm or steady", simpleDefinition: "Wobbly and unreliable — could fall apart at any time" },
  "unsurprised": { definition: "Not surprised", simpleDefinition: "Not shocked — you expected this to happen" },
  "untamed": { definition: "Wild, uncontrolled, especially of animals not domesticated or trained to human contact.", simpleDefinition: "Wild and not under anyone's control" },
  "unthinking": { definition: "Not using thought or consideration; thoughtless", simpleDefinition: "Acting without stopping to consider others" },
  "unwilling": { definition: "Not ready or eager to do something; reluctant", simpleDefinition: "Not wanting to do something — reluctant" },
  "unwise": { definition: "Not wise; lacking wisdom", simpleDefinition: "Not showing good judgement; foolish" },
  "uphold": { definition: "To hold up; to lift on high; to elevate.", simpleDefinition: "To support and maintain something" },
  "use": { definition: "To utilize or employ.", simpleDefinition: "To do something with an object for a purpose" },
  "useful": { definition: "Able to be used for a practical purpose; helpful", simpleDefinition: "Helpful and serving a practical purpose" },
  "useless": { definition: "Not fulfilling any purpose; without practical value", simpleDefinition: "No use — won't help or achieve anything" },
  "utilise": { definition: "To make practical use of something", simpleDefinition: "To make practical use of something" },
  "varied": { definition: "Showing a range of different things; not all the same", simpleDefinition: "Having many different kinds — not all the same" },
  "venerate": { definition: "To regard with great respect and reverence", simpleDefinition: "To show very deep respect for someone" },
  "venom": { definition: "Poison; bitter hatred or spite", simpleDefinition: "Poison; bitter anger and spite" },
  "versed": { definition: "Knowledgeable or skilled, either through study or experience; familiar; practiced", simpleDefinition: "Having knowledge or experience in something" },
  "veteran": { definition: "A person with long experience in a field", simpleDefinition: "Someone with a lot of experience" },
  "viable": { definition: "Capable of working successfully; feasible", simpleDefinition: "Possible and likely to work" },
  "vibrant": { definition: "Full of energy and life; bright and striking", simpleDefinition: "Full of energy and colour" },
  "vice": { definition: "Immoral or wicked behaviour; a bad habit", simpleDefinition: "A bad or immoral habit" },
  "vigorous": { definition: "Strong, healthy and full of energy", simpleDefinition: "Strong and full of energy" },
  "violation": { definition: "The act or an instance of violating or the condition of being violated.", simpleDefinition: "Breaking a rule or law" },
  "vital": { definition: "Absolutely necessary; essential to life", simpleDefinition: "Absolutely essential — life depends on it" },
  "voracious": { definition: "Having a very great appetite; extremely eager", simpleDefinition: "Having an enormous appetite for something" },
  "vulnerability": { definition: "The quality of being easily hurt or attacked", simpleDefinition: "Being easily hurt or taken advantage of" },
  "warmonger": { definition: "A person who tries to bring about war", simpleDefinition: "Someone who tries to start wars" },
  "wasteful": { definition: "Using more than is needed; not careful with resources", simpleDefinition: "Using more than needed — not careful" },
  "watchful": { definition: "Alert and carefully observing what is happening", simpleDefinition: "Alert and observing everything carefully" },
  "weak": { definition: "Lacking strength or power; easily broken", simpleDefinition: "Lacking strength or power" },
  "weakness": { definition: "The condition of being weak.", simpleDefinition: "Lack of strength or power; a fault" },
  "wealth": { definition: "An abundance of money or valuable possessions", simpleDefinition: "A large amount of money or possessions" },
  "wealthy": { definition: "Having a great deal of money and possessions; rich", simpleDefinition: "Having a lot of money — rich" },
  "weary": { definition: "Very tired after effort or endurance", simpleDefinition: "Very tired from effort or strain" },
  "well-known": { definition: "Known by many people; famous or familiar", simpleDefinition: "Known by lots of people" },
  "well-maintained": { definition: "Kept in good condition through regular care", simpleDefinition: "Kept in good condition with care" },
  "whole": { definition: "Complete; with nothing left out or missing", simpleDefinition: "Complete — nothing missing" },
  "wicked": { definition: "Evil or morally wrong; playfully mischievous", simpleDefinition: "Evil and morally very wrong" },
  "wickedness": { definition: "The state of being wicked; evil disposition; immorality.", simpleDefinition: "The quality of being evil or morally wrong" },
  "wild": { definition: "Untamed and uncontrolled; living in a natural state", simpleDefinition: "Free and untamed — like an animal in the jungle" },
  "willing": { definition: "Ready and eager to do something", simpleDefinition: "Happy and ready to do something" },
  "wilt": { definition: "To become limp through heat or lack of water; to weaken", simpleDefinition: "To droop and lose energy; to weaken" },
  "wise": { definition: "Having experience and good judgement", simpleDefinition: "Having good judgement from experience" },
  "wistful": { definition: "Having a feeling of vague longing for something", simpleDefinition: "Feeling a gentle longing for something" },
  "withdraw": { definition: "To take back or move away from a position", simpleDefinition: "To move back or take something away" },
  "withstand": { definition: "To remain undamaged or unaffected by something", simpleDefinition: "To resist and not be damaged by something" },
  "worried": { definition: "Feeling anxious and troubled about something", simpleDefinition: "Feeling anxious and troubled about something" },
  "worsen": { definition: "To make worse; to impair.", simpleDefinition: "To become worse or make something worse" },
  "worthwhile": { definition: "Worth the time and effort spent; of real value", simpleDefinition: "Worth the time and effort — genuinely valuable" },
  "yield": { definition: "To give way under pressure; to produce a result", simpleDefinition: "To give way; to produce a result" },
  "yielding": { definition: "Tending to give way; flexible and not resistant", simpleDefinition: "Giving way easily; flexible" },
  "accidental": { definition: "Happening by chance, not on purpose", simpleDefinition: "Something that happened by accident, not on purpose" },
  "admirable": { definition: "Deserving respect and approval; impressive", simpleDefinition: "Worthy of being looked up to and respected" },
  "admiration": { definition: "A feeling of respect and approval towards someone", simpleDefinition: "When you really look up to someone and think highly of them" },
  "aggressive": { definition: "Ready to attack or confront others; forceful", simpleDefinition: "Likely to start fights or act in a threatening way" },
  "agreement": { definition: "A shared understanding or decision between two or more people", simpleDefinition: "When two or more people both say yes to the same thing" },
  "ally": { definition: "A person or group that supports and helps another", simpleDefinition: "Someone on your side who helps and supports you" },
  "allow": { definition: "To permit someone to do something; to let something happen", simpleDefinition: "To say yes and let something happen" },
  "anger": { definition: "A strong feeling of displeasure or annoyance", simpleDefinition: "The feeling you get when something upsets or annoys you a lot" },
  "assist": { definition: "To help someone with a task or problem", simpleDefinition: "To give someone a hand and help them with something" },
  "beg": { definition: "To ask earnestly or desperately for something", simpleDefinition: "To ask for something really desperately, often over and over" },
  "bitterness": { definition: "A sharp, painful feeling of resentment or disappointment", simpleDefinition: "A deep, lingering feeling of hurt and unfairness" },
  "blunt": { definition: "Direct and straightforward, sometimes to the point of rudeness", simpleDefinition: "Very direct and honest — maybe more than is polite" },
  "calm": { definition: "Free from excitement or agitation; peaceful", simpleDefinition: "Quiet and not worried or stressed" },
  "caring": { definition: "Showing kindness and concern for others", simpleDefinition: "Being kind and thoughtful about how other people feel" },
  "carelessness": { definition: "A lack of attention or concern; not being careful", simpleDefinition: "Not paying enough attention — making mistakes by being sloppy" },
  "casual": { definition: "Relaxed and not overly concerned; informal", simpleDefinition: "Laid-back and not taking things too seriously" },
  "cause": { definition: "A reason that makes something happen; to bring something about", simpleDefinition: "The reason why something happens" },
  "claim": { definition: "To state that something is true without proof; to assert", simpleDefinition: "To say something is true, even if you can't prove it" },
  "combative": { definition: "Ready and eager to fight or argue", simpleDefinition: "Itching for a fight or argument" },
  "commend": { definition: "To praise someone formally; to recommend", simpleDefinition: "To praise someone and say they've done well" },
  "compassionate": { definition: "Showing sympathy and concern for others' suffering", simpleDefinition: "Feeling sorry for people who are hurting and wanting to help" },
  "conceit": { definition: "Excessive pride in oneself; vanity", simpleDefinition: "Thinking you are far better than everyone else" },
  "concerned": { definition: "Worried or troubled about something", simpleDefinition: "A bit worried about something and caring about what happens" },
  "conflict": { definition: "A serious disagreement or struggle between people or groups", simpleDefinition: "A fight or serious disagreement between people" },
  "conformist": { definition: "A person who follows accepted rules and behaviour without questioning them", simpleDefinition: "Someone who does what everyone else does and doesn't rock the boat" },
  "consistent": { definition: "Always behaving or performing in the same way; reliable", simpleDefinition: "Always the same — you know what to expect" },
  "contemptuous": { definition: "Showing a strong feeling that someone or something is worthless", simpleDefinition: "Treating something or someone like they are completely beneath you" },
  "contentment": { definition: "A state of peaceful satisfaction and happiness", simpleDefinition: "Feeling happy and satisfied with what you have" },
  "control": { definition: "The power to manage or influence something; to direct", simpleDefinition: "Being in charge of something and deciding what happens" },
  "cooperative": { definition: "Willing to work with others for a common goal", simpleDefinition: "Happy to work with other people and help things go smoothly" },
  "correct": { definition: "Free from error; in accordance with fact or truth", simpleDefinition: "Right — no mistakes" },
  "corruption": { definition: "Dishonest or illegal behaviour, especially by people in power", simpleDefinition: "Using power in a dishonest or illegal way for personal gain" },
  "courage": { definition: "The ability to face fear or danger without giving in", simpleDefinition: "Being brave even when something is scary" },
  "courteous": { definition: "Polite and respectful in manner", simpleDefinition: "Well-mannered and respectful to others" },
  "create": { definition: "To make or produce something new", simpleDefinition: "To make something that didn't exist before" },
  "crush": { definition: "To defeat completely; to press with great force so as to damage", simpleDefinition: "To completely squash or defeat something" },
  "damage": { definition: "Physical harm caused to something; to impair", simpleDefinition: "When something is broken or harmed" },
  "deceit": { definition: "The action of deceiving someone; dishonesty", simpleDefinition: "Lying or tricking someone into believing something false" },
  "defeat": { definition: "To win a victory over; to overcome in competition", simpleDefinition: "To beat someone in a competition or fight" },
  "delicate": { definition: "Very fine in texture or structure; easily broken or damaged", simpleDefinition: "Fragile and needing careful handling" },
  "demand": { definition: "To ask for something firmly and forcefully", simpleDefinition: "To insist on having something — not taking no for an answer" },
  "disagreement": { definition: "A difference of opinion; a failure to agree", simpleDefinition: "When two or more people don't see things the same way" },
  "discourage": { definition: "To make someone less confident or willing to try", simpleDefinition: "To put someone off trying — making them feel it's not worth it" },
  "eager": { definition: "Keen and enthusiastic to do or have something", simpleDefinition: "Really wanting to do something and excited about it" },
  "eagerness": { definition: "Enthusiasm and keenness to do something", simpleDefinition: "Being really keen and excited to get started" },
  "empty": { definition: "Containing nothing; lacking meaning or sincerity", simpleDefinition: "Nothing inside — or without real meaning" },
  "encourage": { definition: "To give support and confidence to someone; to inspire them to try", simpleDefinition: "To cheer someone on and help them feel they can do it" },
  "enemy": { definition: "A person who is hostile to and opposes another", simpleDefinition: "Someone who is against you and wants to cause you harm" },
  "energy": { definition: "The strength and vitality needed to act or do things", simpleDefinition: "The power inside you that lets you move, work and do things" },
  "enthusiasm": { definition: "Intense and eager enjoyment, interest, or approval", simpleDefinition: "Real excitement and passion for something you love" },
  "entreat": { definition: "To ask someone earnestly and urgently", simpleDefinition: "To beg someone pleadingly to do something" },
  "evil": { definition: "Deeply wicked and harmful; morally wrong", simpleDefinition: "Very wicked and wanting to cause harm" },
  "exemplary": { definition: "Serving as a desirable model; outstandingly good", simpleDefinition: "So good it sets an example for others to follow" },
  "expose": { definition: "To reveal or uncover something hidden", simpleDefinition: "To reveal something that was being hidden or kept secret" },
  "fairness": { definition: "Treating people equally and without favouritism", simpleDefinition: "Giving everyone the same fair chance — no cheating or favourites" },
  "faultless": { definition: "Without fault or defect; perfect", simpleDefinition: "Completely perfect — no mistakes at all" },
  "fearful": { definition: "Feeling afraid; likely to cause fear", simpleDefinition: "Feeling scared or very worried about something" },
  "firm": { definition: "Steady and not easily changed; strong and definite", simpleDefinition: "Strong and not changing — standing your ground" },
  "flawed": { definition: "Having a fault or weakness; imperfect", simpleDefinition: "Having a flaw or weakness that makes it not quite right" },
  "force": { definition: "Physical power or strength; to make someone do something", simpleDefinition: "Using power or pressure to make something happen" },
  "forgiveness": { definition: "The act of forgiving someone who has done wrong", simpleDefinition: "Choosing to let go of anger and not hold a grudge" },
  "forgiving": { definition: "Ready and willing to forgive others", simpleDefinition: "Quick to forgive people even when they've done something wrong" },
  "free": { definition: "Not under the control of another; able to act as one chooses", simpleDefinition: "Able to do what you want — not trapped or controlled" },
  "friendship": { definition: "A close relationship between people who care about each other", simpleDefinition: "A caring and trusting relationship between friends" },
  "good-natured": { definition: "Having a kind and cheerful nature; easy-going", simpleDefinition: "Friendly and easy to get along with — never grumpy" },
  "guilt": { definition: "A feeling of having done something wrong or failing a duty", simpleDefinition: "That uncomfortable feeling you get when you've done something wrong" },
  "happiness": { definition: "The state of feeling or showing pleasure and contentment", simpleDefinition: "Feeling joyful and satisfied with life" },
  "harmony": { definition: "A pleasing combination; peaceful agreement between people", simpleDefinition: "When everything works well together and there is peace" },
  "help": { definition: "To make it easier for someone to do something; to assist", simpleDefinition: "To make things easier for someone else" },
  "honesty": { definition: "The quality of being truthful and free from deceit", simpleDefinition: "Always telling the truth and not trying to deceive anyone" },
  "hopeful": { definition: "Feeling or inspiring optimism about the future", simpleDefinition: "Believing that good things are going to happen" },
  "hostility": { definition: "Unfriendly or aggressive opposition towards someone", simpleDefinition: "Acting in an unfriendly or threatening way toward someone" },
  "imperfect": { definition: "Having faults or weaknesses; not fully correct", simpleDefinition: "Not quite right — has some flaws or mistakes" },
  "independent": { definition: "Free from outside control; not relying on others", simpleDefinition: "Able to do things on your own without needing help" },
  "indifference": { definition: "Lack of interest, concern, or sympathy", simpleDefinition: "Not caring about something at all — completely unmoved" },
  "inflexible": { definition: "Unwilling to change; rigid", simpleDefinition: "Stubborn and not willing to bend or change" },
  "innocent": { definition: "Not guilty of a crime or offence; without wrongdoing", simpleDefinition: "Not having done anything wrong — clean and blameless" },
  "intense": { definition: "Very strong or extreme in degree or strength", simpleDefinition: "Extremely strong or serious — going all-in" },
  "irritable": { definition: "Easily upset or annoyed; quickly angered", simpleDefinition: "Getting annoyed easily — quick to lose patience" },
  "liberator": { definition: "A person who sets others free from oppression or captivity", simpleDefinition: "Someone who frees others from being trapped or oppressed" },
  "maintain": { definition: "To keep something in its existing state; to continue", simpleDefinition: "To keep something going or in good condition" },
  "malicious": { definition: "Having the desire to harm or upset others", simpleDefinition: "Wanting to hurt or cause problems for someone on purpose" },
  "mean": { definition: "Unkind and unpleasant towards others; unwilling to share", simpleDefinition: "Unkind and nasty to others" },
  "misery": { definition: "A state of great unhappiness and distress", simpleDefinition: "Feeling deeply sad and suffering a lot" },
  "mistaken": { definition: "Wrong in one's opinion or judgement; in error", simpleDefinition: "Having got something wrong — making an error" },
  "nimble": { definition: "Quick and light in movement; agile", simpleDefinition: "Quick, light and able to move easily and skilfully" },
  "obedient": { definition: "Willingly following rules or instructions", simpleDefinition: "Doing what you are told without arguing" },
  "obstruct": { definition: "To block or hinder the movement or progress of something", simpleDefinition: "To get in the way and stop something from moving forward" },
  "opposition": { definition: "Resistance or conflict against something", simpleDefinition: "Being against something and resisting it" },
  "optimistic": { definition: "Hopeful and confident about the future", simpleDefinition: "Believing things will turn out well" },
  "outgoing": { definition: "Friendly and socially confident; extroverted", simpleDefinition: "Confident and happy to talk to people — loves being social" },
  "overcome": { definition: "To succeed in dealing with a problem or difficulty", simpleDefinition: "To get past a problem and come out on top" },
  "passion": { definition: "A strong and barely controllable emotion or enthusiasm", simpleDefinition: "A very powerful feeling or love for something" },
  "persuade": { definition: "To convince someone to do or believe something", simpleDefinition: "To talk someone into doing or thinking something" },
  "planned": { definition: "Arranged or organised in advance", simpleDefinition: "Thought out and organised ahead of time" },
  "playful": { definition: "Fond of games and fun; light-hearted", simpleDefinition: "Fun-loving and enjoying games and jokes" },
  "preserve": { definition: "To keep something safe from harm or decay", simpleDefinition: "To protect and keep something as it is" },
  "prevent": { definition: "To stop something from happening", simpleDefinition: "To stop something from happening before it does" },
  "pride": { definition: "A feeling of deep satisfaction from achievements or qualities", simpleDefinition: "A good feeling you get from doing something well" },
  "promising": { definition: "Showing signs of future success; hopeful", simpleDefinition: "Looking like it will go well — has great potential" },
  "provoke": { definition: "To deliberately make someone angry or react", simpleDefinition: "To wind someone up or stir up a reaction on purpose" },
  "quarrelsome": { definition: "Given to arguing and quarrelling; contentious", simpleDefinition: "Always looking for an argument — quick to pick a fight" },
  "rash": { definition: "Acting without thinking; done too quickly and carelessly", simpleDefinition: "Done too quickly without thinking about the consequences" },
  "reject": { definition: "To dismiss or refuse to accept something or someone", simpleDefinition: "To say no and push something or someone away" },
  "reliable": { definition: "Consistently good and able to be trusted", simpleDefinition: "Someone or something you can always count on" },
  "reluctance": { definition: "Unwillingness to do something; hesitation", simpleDefinition: "Not really wanting to do something — holding back" },
  "repulse": { definition: "To push back or drive away; to cause disgust", simpleDefinition: "To push away or cause a feeling of strong disgust" },
  "reserved": { definition: "Slow to reveal emotion or opinions; quiet and restrained", simpleDefinition: "Quiet and keeping feelings to yourself — not showing much" },
  "resentment": { definition: "A feeling of anger and displeasure about being treated unfairly", simpleDefinition: "A simmering feeling of anger about something you think was unfair" },
  "resistant": { definition: "Able to withstand something; unwilling to accept change", simpleDefinition: "Standing firm and refusing to be changed or affected" },
  "resolve": { definition: "To find a solution to; to decide firmly on something", simpleDefinition: "To sort out a problem or make a firm decision" },
  "ridicule": { definition: "To make someone the subject of mockery; to laugh at cruelly", simpleDefinition: "To mock someone or make fun of them in a cruel way" },
  "righteousness": { definition: "The quality of being morally right and just", simpleDefinition: "Being morally good and always doing the right thing" },
  "rival": { definition: "A person competing with another for the same goal", simpleDefinition: "A competitor — someone trying to beat you at the same thing" },
  "robust": { definition: "Strong and healthy; sturdy and vigorous", simpleDefinition: "Strong, healthy and full of energy" },
  "sadness": { definition: "The condition of feeling sorrow or unhappiness", simpleDefinition: "The feeling of being unhappy or upset" },
  "scold": { definition: "To rebuke or speak angrily to someone who has done wrong", simpleDefinition: "To tell someone off sharply for doing something wrong" },
  "scorn": { definition: "Strong contempt or disdain; to treat as inferior", simpleDefinition: "Looking down on something or treating it with complete contempt" },
  "secret": { definition: "Something kept hidden from others; concealed", simpleDefinition: "Something that is kept hidden and not told to others" },
  "severity": { definition: "The quality of being very serious or strict; harshness", simpleDefinition: "Being very strict or serious — no softness at all" },
  "shallow": { definition: "Not showing serious thought; lacking depth", simpleDefinition: "Only caring about surface things — no real depth of thought" },
  "sincere": { definition: "Free from pretence; genuinely meaning what you say", simpleDefinition: "Truly meaning what you say — no pretending" },
  "sincerity": { definition: "The quality of being honest and genuine", simpleDefinition: "Being completely genuine and meaning exactly what you say" },
  "sly": { definition: "Clever in a secretive or underhanded way; cunning", simpleDefinition: "Sneaky and clever in a crafty, not-quite-honest way" },
  "sociable": { definition: "Willing to talk and be friendly with others", simpleDefinition: "Enjoying being around people and easy to get along with" },
  "soothe": { definition: "To gently calm someone who is upset or in pain", simpleDefinition: "To calm someone down and make them feel better" },
  "spiteful": { definition: "Deliberately wanting to hurt or upset others", simpleDefinition: "Doing mean things just to hurt someone's feelings" },
  "straightforward": { definition: "Easy to understand; honest and without complications", simpleDefinition: "Simple and honest — no tricks or hidden meaning" },
  "strengthen": { definition: "To make or become stronger", simpleDefinition: "To make something more powerful or firm" },
  "stingy": { definition: "Unwilling to give or spend; mean with money", simpleDefinition: "Very mean with money — refusing to share or spend" },
  "sturdy": { definition: "Strongly built; not likely to break or give way", simpleDefinition: "Solid and strong — not going to break easily" },
  "success": { definition: "The achievement of a goal or aim; a favourable outcome", simpleDefinition: "Achieving what you set out to do" },
  "sulky": { definition: "Sullen and bad-tempered through resentment; moody", simpleDefinition: "In a grumpy mood and refusing to cheer up" },
  "supporter": { definition: "A person who supports a cause, team, or person", simpleDefinition: "Someone who backs you up and is on your side" },
  "sympathy": { definition: "Understanding and sharing another person's feelings", simpleDefinition: "Feeling sorry for someone and understanding their sadness" },
  "talkative": { definition: "Fond of talking; inclined to talk a great deal", simpleDefinition: "Always talking — loves to chat and never stops" },
  "transparent": { definition: "Easy to see through; having no hidden agenda; honest", simpleDefinition: "Open and honest — nothing hidden or secretive" },
  "unreliable": { definition: "Not able to be trusted or depended upon", simpleDefinition: "Can't be counted on — lets you down when you need them" },
  "vitality": { definition: "The state of being strong, active, and full of energy", simpleDefinition: "Bursting with life and energy" },
  "warm": { definition: "Having or showing kindness and affection", simpleDefinition: "Friendly, caring and full of kindness" },
  "waver": { definition: "To be uncertain or unsteady; to hesitate between choices", simpleDefinition: "To go back and forth, unsure what to do or believe" },
  "weaken": { definition: "To make or become less strong or forceful", simpleDefinition: "To make something less powerful or certain" },
  "welcome": { definition: "Received with pleasure; to greet someone gladly", simpleDefinition: "To receive someone happily and make them feel wanted" },
  "withdrawn": { definition: "Not wanting to communicate; quiet and remote", simpleDefinition: "Keeping to yourself and not wanting to talk or join in" },
  "giving": { definition: "Generous in sharing with or helping others", simpleDefinition: "Happy to give things to others without expecting anything back" },
  "criticise": { definition: "To point out faults or problems in something or someone", simpleDefinition: "To tell someone what they did wrong or what could be better" },
  "condemn": { definition: "To express strong disapproval of something; to judge as wrong", simpleDefinition: "To say something is very wrong or unacceptable" },
  "clumsy": { definition: "Lacking coordination; likely to drop or knock things over", simpleDefinition: "Bumping into things and dropping stuff — not very graceful" },
  "emotional": { definition: "Having strong feelings; easily moved by feelings", simpleDefinition: "Feeling things very strongly and showing it" },
  "conquer": { definition: "To overcome and take control of something by force or effort", simpleDefinition: "To beat and take control — to win completely" },
  "harshness": { definition: "The quality of being severe, rough, or unkind", simpleDefinition: "Being rough and unkind — without any gentleness" },
  "friend": { definition: "A person you know well and like; a companion", simpleDefinition: "Someone you like and trust who is on your side" },
  "compliment": { definition: "A polite expression of praise or admiration", simpleDefinition: "Saying something nice to someone to make them feel good" },
  "improve": { definition: "To make or become better than before", simpleDefinition: "To get better at something or make something better" }
};

// Looks up a word in WORD_MAP first, falls back to DISTRACTOR_DICT
function lookupWord(word) { return WORD_MAP[word] || DISTRACTOR_DICT[word] || null; }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speak(word) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = "en-GB"; u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

// All four question formats
const FORMATS = ["synonym", "antonym", "definition", "fillblank"];

// Which formats are available for a given word
function availableFormats(w) {
  const fmts = ["synonym"]; // always available if synonyms exist
  if (w.antonyms?.length) fmts.push("antonym");
  if (w.definition) fmts.push("definition");
  if (w.example) fmts.push("fillblank");
  return fmts;
}

// Next format due for a word — picks the least-recently-seen available format
function nextFormatDue(wordEntry, leitnerEntry) {
  const formats = availableFormats(wordEntry);
  const seen = leitnerEntry?.formats || {};
  // Prioritise formats not yet passed, then least recently seen
  const unpassed = formats.filter(f => !seen[f]);
  if (unpassed.length) return unpassed[0];
  // All passed — pick least recently seen
  return formats.sort((a, b) => (seen[a] || 0) - (seen[b] || 0))[0];
}

// Mastery = box >= 3 AND all available formats passed at least once
function isMastered(wordEntry, leitnerEntry) {
  if (!leitnerEntry || leitnerEntry.box < 3) return false;
  const formats = availableFormats(wordEntry);
  const seen = leitnerEntry.formats || {};
  return formats.every(f => seen[f]);
}

function getDueWords(leitnerBoxes) {
  const now = Date.now();
  const intervals = [0, 1, 3, 7, 14, 30];
  const due = [];
  VOCAB_BANK.forEach(w => {
    const entry = leitnerBoxes[w.word];
    if (!entry) { due.push({ ...w, box: 0, nextFormat: nextFormatDue(w, null) }); return; }
    const daysSince = (now - entry.lastSeen) / 86400000;
    if (daysSince >= intervals[Math.min(entry.box, 5)]) {
      due.push({ ...w, box: entry.box, nextFormat: nextFormatDue(w, entry) });
    }
  });
  return shuffle(due);
}

function makeDistractors(wordEntry, field) {
  // Exclude correct answers and the word itself from distractor pool
  const correctPool = new Set([
    ...(wordEntry.synonyms || []),
    ...(wordEntry.antonyms || []),
    wordEntry.word,
  ]);

  // Words semantically related to the target (its synonyms + antonyms)
  const targetRelated = new Set([
    ...(wordEntry.synonyms || []),
    ...(wordEntry.antonyms || []),
  ]);

  const samePosWords = VOCAB_BANK.filter(w =>
    w.word !== wordEntry.word && w.pos === wordEntry.pos
  );

  // Priority 1: same-POS words that share semantic territory with the target
  // (their synonyms or antonyms overlap with the target's synonyms/antonyms).
  // These produce plausible near-miss distractors rather than random adjectives.
  const semanticallyClose = samePosWords.filter(w => {
    const wRelated = [...(w.synonyms || []), ...(w.antonyms || [])];
    return wRelated.some(r => targetRelated.has(r));
  });

  let pool = semanticallyClose
    .flatMap(w => w[field] || [])
    .filter(d => !correctPool.has(d));

  // Priority 2: all same-POS if semantically close pool is too thin
  if (pool.length < 6) {
    pool = samePosWords
      .flatMap(w => w[field] || [])
      .filter(d => !correctPool.has(d));
  }

  // Priority 3: any POS as last resort
  if (pool.length < 3) {
    pool = VOCAB_BANK
      .filter(w => w.word !== wordEntry.word)
      .flatMap(w => w[field] || [])
      .filter(d => !correctPool.has(d));
  }

  return shuffle([...new Set(pool)]).slice(0, 3);
}

function buildQuestion(wordEntry, qType) {
  if (qType === "synonym") {
    const correct = wordEntry.synonyms[Math.floor(Math.random() * wordEntry.synonyms.length)];
    return { type: "synonym", word: wordEntry.word, correct, options: shuffle([correct, ...makeDistractors(wordEntry, "synonyms")]) };
  }
  if (qType === "antonym") {
    if (!wordEntry.antonyms?.length) return null;
    const correct = wordEntry.antonyms[Math.floor(Math.random() * wordEntry.antonyms.length)];
    return { type: "antonym", word: wordEntry.word, correct, options: shuffle([correct, ...makeDistractors(wordEntry, "antonyms")]) };
  }
  if (qType === "definition") {
    if (!wordEntry.definition) return null;
    // Show definition, pick the correct word from bank words of same POS
    const distractors = shuffle(
      VOCAB_BANK.filter(w => w.word !== wordEntry.word && w.pos === wordEntry.pos)
    ).slice(0, 3).map(w => w.word);
    if (distractors.length < 3) return null;
    return { type: "definition", word: wordEntry.word, correct: wordEntry.word, options: shuffle([wordEntry.word, ...distractors]), clue: wordEntry.definition };
  }
  if (qType === "fillblank") {
    const fillSentence = FILL_BLANK_EXAMPLES[wordEntry.word] || wordEntry.example;
    if (!fillSentence) return null;
    const blanked = fillSentence.replace(new RegExp(`\\b${wordEntry.word}\\b`, "gi"), "______");
    if (blanked === fillSentence) return null; // word not found in sentence
    const distractors = shuffle(
      VOCAB_BANK.filter(w => w.word !== wordEntry.word && w.pos === wordEntry.pos)
    ).slice(0, 3).map(w => w.word);
    if (distractors.length < 3) return null;
    return { type: "fillblank", word: wordEntry.word, correct: wordEntry.word, options: shuffle([wordEntry.word, ...distractors]), clue: blanked };
  }
  return null;
}

// ROOT_TIPS — replaced during HTML build with full content from root-tips.js
const ROOT_TIPS = {};

// FILL_BLANK_EXAMPLES — replaced during HTML build with fill-blank-examples.js
// Sentences written specifically for fill-in-the-blank: short, specific, one right answer
const FILL_BLANK_EXAMPLES = {};

// AI abstraction — replaced during HTML build with Cowork/API-key version
async function callAI(prompt, system) {
  if (typeof window !== 'undefined' && window.claude?.complete) {
    try { return await window.claude.complete(prompt, { system }); } catch { return null; }
  }
  return null;
}

async function storageGet(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function storageSet(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); } catch {}
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink:#1a1a2e; --ink-soft:#4a4a6a; --paper:#faf8f3; --cream:#f0ebe0;
    --accent:#e85d26; --accent-soft:#fde8de;
    --gold:#c9963a; --gold-soft:#fdf3e0;
    --green:#2d7a52; --green-soft:#e0f2ea;
    --blue:#2355a0; --blue-soft:#e0e9f8;
    --purple:#6b3fa0; --purple-soft:#ede8f8;
    --red:#c0392b; --red-soft:#fde8e6;
    --border:#ddd8cc; --radius:12px; --radius-sm:8px;
    --shadow:0 2px 12px rgba(26,26,46,0.08);
  }
  body { font-family:'DM Sans',sans-serif; background:var(--paper); color:var(--ink); }
  .app { min-height:100vh; display:flex; flex-direction:column; }

  .header { background:var(--ink); color:white; padding:0 18px; display:flex; align-items:center; justify-content:space-between; height:54px; position:sticky; top:0; z-index:100; }
  .logo { font-family:'Fraunces',serif; font-size:18px; font-weight:700; display:flex; align-items:baseline; gap:6px; }
  .logo span { color:var(--accent); }
  .logo .ver { font-size:10px; opacity:0.35; font-family:'DM Sans',sans-serif; font-weight:400; }
  .hdr-right { display:flex; align-items:center; gap:8px; }
  .mode-toggle { display:flex; background:rgba(255,255,255,0.1); border-radius:20px; padding:3px; }
  .mode-btn { padding:4px 12px; border-radius:16px; border:none; font-size:12px; font-weight:600; cursor:pointer; background:transparent; color:rgba(255,255,255,0.5); font-family:'DM Sans',sans-serif; transition:all 0.15s; }
  .mode-btn.active { background:white; color:var(--ink); }
  .ai-pill { display:flex; align-items:center; gap:4px; font-size:11px; padding:3px 9px; border-radius:10px; cursor:pointer; font-weight:600; }
  .ai-pill.on { background:var(--green-soft); color:var(--green); }
  .ai-pill.off { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.35); }
  .ai-dot { width:5px; height:5px; border-radius:50%; }
  .ai-pill.on .ai-dot { background:var(--green); }
  .ai-pill.off .ai-dot { background:rgba(255,255,255,0.2); }

  .profile-pill { display:flex; align-items:center; gap:5px; font-size:11px; padding:3px 9px; border-radius:10px; cursor:pointer; font-weight:600; background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.85); transition:background 0.15s; max-width:100px; }
  .profile-pill:hover { background:rgba(255,255,255,0.15); }
  .profile-pill .p-avatar { font-size:14px; line-height:1; }
  .profile-pill .p-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  .profile-overlay { position:fixed; inset:0; background:rgba(26,26,46,0.55); z-index:500; display:flex; align-items:center; justify-content:center; padding:16px; }
  .profile-panel { background:white; border-radius:16px; padding:24px; width:100%; max-width:380px; box-shadow:0 8px 40px rgba(26,26,46,0.22); }
  .profile-panel-title { font-family:'Fraunces',serif; font-size:20px; font-weight:700; margin-bottom:4px; }
  .profile-panel-sub { font-size:12px; color:var(--ink-soft); margin-bottom:18px; }
  .profile-list { display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
  .profile-card { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:10px; border:2px solid var(--border); cursor:pointer; transition:all 0.15s; }
  .profile-card:hover { border-color:var(--accent); background:var(--accent-soft); }
  .profile-card.active { border-color:var(--accent); background:var(--accent-soft); }
  .profile-card .pc-avatar { font-size:22px; line-height:1; }
  .profile-card .pc-name { font-weight:600; font-size:14px; }
  .profile-card .pc-stats { font-size:11px; color:var(--ink-soft); }
  .profile-card .pc-check { margin-left:auto; color:var(--accent); font-size:16px; }
  .add-profile-btn { width:100%; padding:10px; border:2px dashed var(--border); border-radius:10px; background:transparent; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; color:var(--ink-soft); cursor:pointer; transition:all 0.15s; }
  .add-profile-btn:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-soft); }
  .profile-close { float:right; background:transparent; border:none; font-size:18px; cursor:pointer; color:var(--ink-soft); line-height:1; padding:2px 4px; }
  .profile-close:hover { color:var(--ink); }

  .creator-panel { }
  .creator-label { font-size:12px; font-weight:600; color:var(--ink-soft); margin-bottom:5px; text-transform:uppercase; letter-spacing:0.4px; }
  .creator-input { width:100%; padding:10px 12px; border:2px solid var(--border); border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px; margin-bottom:14px; outline:none; }
  .creator-input:focus { border-color:var(--accent); }
  .avatar-grid { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:14px; }
  .avatar-opt { width:36px; height:36px; border-radius:8px; border:2px solid var(--border); background:var(--cream); font-size:18px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.12s; }
  .avatar-opt.sel { border-color:var(--accent); background:var(--accent-soft); }
  .colour-grid { display:flex; gap:7px; margin-bottom:18px; }
  .colour-opt { width:26px; height:26px; border-radius:50%; border:3px solid transparent; cursor:pointer; transition:border-color 0.12s; }
  .colour-opt.sel { border-color:var(--ink); }
  .creator-actions { display:flex; gap:8px; }
  .creator-save { flex:1; padding:10px; background:var(--accent); color:white; border:none; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; cursor:pointer; }
  .creator-save:disabled { opacity:0.4; cursor:not-allowed; }
  .creator-cancel { padding:10px 14px; background:var(--cream); color:var(--ink); border:none; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; }

  .nav { display:flex; border-bottom:1px solid var(--border); background:white; padding:0 18px; overflow-x:auto; }
  .nav-btn { padding:12px 16px; border:none; background:transparent; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; color:var(--ink-soft); cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; transition:all 0.15s; }
  .nav-btn.active { color:var(--accent); border-bottom-color:var(--accent); }

  .main { flex:1; padding:18px 14px; max-width:780px; margin:0 auto; width:100%; }

  .card { background:white; border:1px solid var(--border); border-radius:var(--radius); padding:18px; box-shadow:var(--shadow); margin-bottom:12px; }
  .card-title { font-family:'Fraunces',serif; font-size:18px; font-weight:700; margin-bottom:2px; }
  .card-sub { font-size:12px; color:var(--ink-soft); margin-bottom:14px; }

  .prog-wrap { height:4px; background:var(--cream); border-radius:2px; overflow:hidden; margin-bottom:14px; }
  .prog-fill { height:100%; background:var(--accent); border-radius:2px; transition:width 0.4s ease; }

  .stats-row { display:flex; gap:8px; margin-bottom:14px; }
  .stat-pill { flex:1; padding:9px 6px; border-radius:var(--radius-sm); text-align:center; background:var(--cream); }
  .stat-pill .val { font-family:'Fraunces',serif; font-size:20px; font-weight:700; }
  .stat-pill .lbl { font-size:10px; color:var(--ink-soft); font-weight:600; text-transform:uppercase; letter-spacing:0.3px; }
  .stat-pill.good .val { color:var(--green); }
  .stat-pill.warn .val { color:var(--accent); }
  .stat-pill.slow .val { color:var(--red); }

  /* QUESTION HEADER */
  .q-header { background:var(--ink); color:white; border-radius:var(--radius) var(--radius) 0 0; padding:18px 20px 16px; margin:-18px -18px 16px; }
  .q-header-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px; gap:10px; }
  .q-badge { display:inline-block; font-size:11px; font-weight:800; letter-spacing:1px; text-transform:uppercase; padding:4px 12px; border-radius:20px; flex-shrink:0; margin-top:4px; }
  .badge-synonym { background:var(--blue); color:white; }
  .badge-antonym { background:var(--accent); color:white; }
  .badge-definition { background:var(--purple); color:white; }
  .badge-fillblank { background:var(--green); color:white; }
  .q-word { font-family:'Fraunces',serif; font-size:30px; font-weight:700; letter-spacing:-0.5px; margin-bottom:0; flex:1; }
  .q-prompt { font-size:13px; color:rgba(255,255,255,0.6); margin-bottom:8px; }
  .q-clue { font-family:'Fraunces',serif; font-size:17px; font-weight:600; color:white; font-style:italic; line-height:1.5; display:block; }
  .q-aids { display:flex; gap:5px; margin-bottom:10px; }
  .q-aid-btn { padding:3px 8px; border-radius:5px; border:1px solid rgba(255,255,255,0.25); background:rgba(255,255,255,0.1); font-size:12px; cursor:pointer; color:white; transition:all 0.1s; line-height:1; user-select:none; }
  .q-aid-btn:hover { background:rgba(255,255,255,0.2); border-color:rgba(255,255,255,0.5); }
  .q-aid-btn.used { background:var(--gold-soft); border-color:var(--gold); color:var(--ink); }
  .q-reveal { font-size:13px; color:rgba(255,255,255,0.85); font-style:italic; line-height:1.5; margin-bottom:4px; animation:fadeIn 0.15s ease; }
  .q-reveal.simple { font-style:normal; color:var(--gold); font-weight:500; }
  .result-word { font-size:12px; color:inherit; opacity:0.8; margin-top:3px; font-style:italic; }

  /* OPTIONS */
  .options-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-bottom:12px; }

  .opt-card { border:2px solid var(--border); border-radius:var(--radius-sm); background:white; transition:border-color 0.12s; }
  .opt-card.clickable { cursor:pointer; }
  .opt-card.clickable:hover { border-color:var(--accent); }
  .opt-card.correct { border-color:var(--green); background:var(--green-soft); }
  .opt-card.wrong { border-color:var(--red); background:var(--red-soft); }

  .opt-top { display:flex; flex-direction:column; align-items:flex-start; padding:12px 12px 10px; gap:8px; }
  .opt-word { font-size:15px; font-weight:700; line-height:1.2; }
  .opt-aids { display:flex; gap:5px; flex-wrap:wrap; }

  .aid-btn {
    padding:3px 8px; border-radius:5px; border:1px solid var(--border);
    background:var(--cream); font-size:12px; cursor:pointer;
    font-family:'DM Sans',sans-serif; color:var(--ink-soft);
    transition:all 0.1s; line-height:1; user-select:none;
  }
  .aid-btn:hover { border-color:var(--ink-soft); background:var(--paper); }
  .aid-btn.used { background:var(--gold-soft); border-color:var(--gold); color:var(--ink); }

  .opt-reveal { padding:8px 12px 10px; font-size:12px; color:var(--ink-soft); font-style:italic; line-height:1.6; border-top:1px solid var(--border); animation:fadeIn 0.15s ease; }
  .opt-reveal.simple { font-style:normal; font-weight:500; color:var(--purple); background:var(--purple-soft); border-top:none; padding-top:8px; }

  .hint-row { font-size:11px; color:var(--ink-soft); text-align:center; margin-bottom:10px; }

  /* RESULT */
  .result-block { padding:12px 14px; border-radius:var(--radius-sm); margin-bottom:10px; animation:fadeIn 0.2s ease; }
  .result-block.correct { background:var(--green-soft); border:1px solid var(--green); }
  .result-block.wrong { background:var(--red-soft); border:1px solid var(--red); }
  .result-icon { font-size:16px; margin-bottom:3px; }
  .result-title { font-weight:700; font-size:14px; margin-bottom:2px; }
  .result-correct { font-size:13px; color:var(--green); font-weight:600; margin-bottom:3px; }
  .result-eg { font-size:11px; color:var(--ink-soft); font-style:italic; }
  .slow-flag { margin-top:7px; padding:5px 8px; background:#fff3cd; border:1px solid #f0ad4e; border-radius:5px; font-size:11px; font-weight:700; color:#856404; }

  .ai-box { background:linear-gradient(135deg,#1a1a2e,#2355a0); color:white; border-radius:var(--radius-sm); padding:12px 14px; margin-bottom:10px; font-size:13px; line-height:1.6; animation:fadeIn 0.3s ease; }
  .ai-label { font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; opacity:0.5; margin-bottom:4px; }

  .next-btn { width:100%; padding:12px; background:var(--ink); color:white; border:none; border-radius:var(--radius-sm); font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:opacity 0.15s; }
  .next-btn:hover { opacity:0.85; }

  /* COMPLETE */
  .complete { text-align:center; padding:36px 14px; }
  .complete-icon { font-size:48px; margin-bottom:12px; }
  .complete-title { font-family:'Fraunces',serif; font-size:22px; font-weight:700; margin-bottom:5px; }
  .complete-sub { font-size:13px; color:var(--ink-soft); margin-bottom:18px; }
  .complete-stats { display:flex; gap:12px; justify-content:center; margin-bottom:18px; }
  .cs .val { font-family:'Fraunces',serif; font-size:28px; font-weight:700; }
  .cs .lbl { font-size:11px; color:var(--ink-soft); }
  .cs.good .val { color:var(--green); }
  .cs.warn .val { color:var(--accent); }

  /* DASHBOARD */
  .domain-row { display:flex; align-items:center; gap:9px; padding:9px 0; border-bottom:1px solid var(--border); }
  .domain-row:last-child { border-bottom:none; }
  .domain-name { width:120px; font-size:12px; font-weight:600; flex-shrink:0; }
  .bar-wrap { flex:1; height:6px; background:var(--cream); border-radius:3px; overflow:hidden; }
  .bar-fill { height:100%; border-radius:3px; }
  .domain-pct { font-family:'Fraunces',serif; font-size:13px; font-weight:700; width:34px; text-align:right; flex-shrink:0; }
  .domain-gap { font-size:10px; color:var(--ink-soft); width:40px; text-align:right; flex-shrink:0; }
  .pbadge { font-size:10px; font-weight:700; padding:2px 6px; border-radius:6px; flex-shrink:0; }
  .p1 { background:var(--red-soft); color:var(--red); }
  .p2 { background:var(--gold-soft); color:var(--gold); }
  .p3 { background:var(--green-soft); color:var(--green); }

  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-bottom:12px; }
  .info-card { padding:11px; background:var(--cream); border-radius:var(--radius-sm); border:1px solid var(--border); }
  .info-card .lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.3px; color:var(--ink-soft); margin-bottom:2px; }
  .info-card .val { font-size:13px; font-weight:600; }

  .sec-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:var(--ink-soft); margin:14px 0 9px; }

  /* AIDS TABLE */
  .aids-table { width:100%; border-collapse:collapse; font-size:12px; }
  .aids-table th { text-align:left; padding:5px 9px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.3px; color:var(--ink-soft); border-bottom:2px solid var(--border); }
  .aids-table td { padding:7px 9px; border-bottom:1px solid var(--border); }
  .aids-table tr:last-child td { border-bottom:none; }
  .status-badge { display:inline-block; padding:2px 7px; border-radius:5px; font-size:10px; font-weight:700; }
  .s-ok { background:var(--green-soft); color:var(--green); }
  .s-aided { background:var(--gold-soft); color:var(--gold); }
  .s-miss { background:var(--red-soft); color:var(--red); }

  .leitner-grid { display:flex; gap:6px; margin-bottom:14px; }
  .lbox { flex:1; padding:9px 5px; border-radius:var(--radius-sm); text-align:center; border:1px solid var(--border); background:var(--cream); }
  .lbox .bnum { font-size:9px; font-weight:700; text-transform:uppercase; color:var(--ink-soft); }
  .lbox .bcount { font-family:'Fraunces',serif; font-size:18px; font-weight:700; }
  .lbox .blabel { font-size:9px; color:var(--ink-soft); }

  .milestone-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:9px; }
  .mc { padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border); background:var(--cream); }
  .mc .mdate { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.3px; color:var(--ink-soft); margin-bottom:2px; }
  .mc .mscore { font-family:'Fraunces',serif; font-size:22px; font-weight:700; color:var(--accent); }
  .mc .mwords { font-size:11px; color:var(--ink-soft); }

  .sched-row { display:flex; align-items:flex-start; gap:10px; padding:9px 0; border-bottom:1px solid var(--border); }
  .sched-row:last-child { border-bottom:none; }
  .sched-day { font-size:10px; font-weight:700; text-transform:uppercase; color:var(--ink-soft); width:48px; flex-shrink:0; padding-top:2px; }
  .sched-act { font-size:13px; font-weight:500; flex:1; }
  .sched-dur { font-size:11px; color:var(--ink-soft); flex-shrink:0; }

  .streak-banner { background:linear-gradient(135deg,var(--gold),var(--accent)); color:white; padding:8px 12px; border-radius:var(--radius-sm); margin-bottom:12px; display:flex; align-items:center; gap:6px; font-size:13px; font-weight:600; }

  .coach-msgs { display:flex; flex-direction:column; gap:7px; max-height:300px; overflow-y:auto; margin-top:12px; }
  .coach-msg { padding:9px 12px; border-radius:var(--radius-sm); font-size:13px; line-height:1.6; }
  .coach-msg.user { background:var(--cream); align-self:flex-end; max-width:80%; }
  .coach-msg.ai { background:var(--ink); color:white; align-self:flex-start; max-width:90%; }
  .coach-input-wrap { display:flex; gap:7px; margin-top:12px; }
  .coach-input { flex:1; padding:9px 11px; border:1px solid var(--border); border-radius:var(--radius-sm); font-family:'DM Sans',sans-serif; font-size:13px; outline:none; }
  .coach-input:focus { border-color:var(--accent); }
  .coach-send { padding:9px 14px; background:var(--accent); color:white; border:none; border-radius:var(--radius-sm); font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer; font-size:13px; }
  .quick-qs { display:flex; gap:5px; flex-wrap:wrap; margin-bottom:9px; }
  .quick-q { padding:5px 9px; font-size:11px; border:1px solid var(--border); border-radius:12px; background:var(--cream); cursor:pointer; font-family:'DM Sans',sans-serif; color:var(--ink-soft); }

  .empty-state { text-align:center; padding:48px 14px; color:var(--ink-soft); }
  .empty-icon { font-size:42px; margin-bottom:9px; }
  .empty-title { font-family:'Fraunces',serif; font-size:17px; color:var(--ink); margin-bottom:5px; }
  .empty-text { font-size:13px; line-height:1.6; }

  .action-btn { width:100%; padding:12px; background:var(--accent); color:white; border:none; border-radius:var(--radius-sm); font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:opacity 0.15s; margin-top:4px; }
  .action-btn:hover { opacity:0.9; }
  .action-btn:disabled { opacity:0.35; cursor:default; }

  @keyframes fadeIn { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:none} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .pulsing { animation:pulse 1.4s infinite; }
`;

// ─── QUESTION AIDS ────────────────────────────────────────────────────────────
// Aids on the question word itself. Logged under "__question" key.
// Unaided correct = mastery signal for Leitner advancement (v1.2a).
function QuestionAids({ word, aidLog = {}, onAidUsed }) {
  const [showDef, setShowDef] = useState(false);
  const [showSimple, setShowSimple] = useState(false);
  const data = lookupWord(word);

  const handleSpeak = () => { speak(word); if (!aidLog.speak) onAidUsed("speak"); };
  const handleDef = () => { setShowDef(v => !v); if (!aidLog.def) onAidUsed("def"); };
  const handleSimple = () => { setShowSimple(v => !v); if (!aidLog.simple) onAidUsed("simple"); };

  return (
    <>
      <div className="q-aids">
        <button className={`q-aid-btn${aidLog.speak ? " used" : ""}`} onClick={handleSpeak} title="Hear the word">🔊 Pronounce</button>
        <button className={`q-aid-btn${aidLog.def ? " used" : ""}`} onClick={handleDef} title="See definition">📖 Definition</button>
        <button className={`q-aid-btn${aidLog.simple ? " used" : ""}`} onClick={handleSimple} title="See definition first" disabled={!showDef} style={!showDef ? {opacity:0.35,cursor:"not-allowed"} : {}}>💡 Simple</button>
      </div>
      {showDef && data && <div className="q-reveal">{data.definition}</div>}
      {showSimple && data && <div className="q-reveal simple">💡 {data.simpleDefinition}</div>}
    </>
  );
}

// ─── OPTION CARD ──────────────────────────────────────────────────────────────
function OptionCard({ opt, selected, correct, answered, onAnswer, onAidUsed, aidLog = {} }) {
  const [showDef, setShowDef] = useState(false);
  const [showSimple, setShowSimple] = useState(false);
  const data = lookupWord(opt);
  let cls = "opt-card";
  if (answered) {
    if (opt === correct) cls += " correct";
    else if (opt === selected) cls += " wrong";
  } else {
    cls += " clickable";
  }

  const stop = e => { e.stopPropagation(); e.preventDefault(); };

  const handleSpeak = e => { stop(e); speak(opt); if (!aidLog.speak) onAidUsed(opt, "speak"); };
  const handleDef = e => { stop(e); setShowDef(v => !v); if (!aidLog.def) onAidUsed(opt, "def"); };
  const handleSimple = e => { stop(e); setShowSimple(v => !v); if (!aidLog.simple) onAidUsed(opt, "simple"); };

  const handleCardClick = e => {
    if (answered) return;
    if (e.target.tagName === "BUTTON") return;
    onAnswer(opt);
  };

  return (
    <div className={cls} onClick={handleCardClick}>
      <div className="opt-top">
        <span className="opt-word">{opt}</span>
        <div className="opt-aids">
          <button className={`aid-btn${aidLog.speak ? " used" : ""}`} onClick={handleSpeak} title="Hear pronunciation">🔊 Pronounce</button>
          <button className={`aid-btn${aidLog.def ? " used" : ""}`} onClick={handleDef} title="Definition">📖 Definition</button>
          <button className={`aid-btn${aidLog.simple ? " used" : ""}`} onClick={handleSimple} title="See definition first" disabled={!showDef} style={!showDef ? {opacity:0.35,cursor:"not-allowed"} : {}}>💡 Simple</button>
        </div>
      </div>
      {showDef && <div className="opt-reveal">{data ? data.definition : "Definition not available for this word."}</div>}
      {showSimple && <div className="opt-reveal simple">💡 {data ? data.simpleDefinition : "Simple explanation not available."}</div>}
    </div>
  );
}

// ─── VOCAB SESSION ────────────────────────────────────────────────────────────
function VocabSession({ leitnerBoxes, onSessionEnd, aiEnabled, mode }) {
  const [queue] = useState(() => {
    const due = getDueWords(leitnerBoxes).slice(0, 20);
    // Distribute formats across the session so they rotate visibly.
    // Each word gets its Leitner-preferred format if it has history,
    // otherwise we cycle through available formats across the queue.
    const formatCycle = ["synonym", "antonym", "definition", "fillblank"];
    let cycleIdx = 0;
    return due.map(w => {
      const hasHistory = leitnerBoxes[w.word]?.formats && Object.keys(leitnerBoxes[w.word].formats).length > 0;
      if (hasHistory) return w; // keep Leitner-assigned nextFormat
      // New word — assign next format in cycle that this word supports
      const available = availableFormats(w);
      let assigned = "synonym";
      for (let i = 0; i < formatCycle.length; i++) {
        const candidate = formatCycle[(cycleIdx + i) % formatCycle.length];
        if (available.includes(candidate)) { assigned = candidate; cycleIdx = (cycleIdx + i + 1) % formatCycle.length; break; }
      }
      return { ...w, nextFormat: assigned };
    });
  });
  const [idx, setIdx] = useState(0);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [aidLog, setAidLog] = useState({});       // per-question: { optWord: { speak, def, simple } }
  const [sessionLog, setSessionLog] = useState([]); // full session aid log
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [aiCoach, setAiCoach] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const t0 = useRef(Date.now());

  useEffect(() => {
    if (!queue.length || idx >= queue.length) { setDone(true); return; }
    const w = queue[idx];
    // Use the format due for this word, fall back gracefully
    const preferred = w.nextFormat || "synonym";
    const q = buildQuestion(w, preferred)
      || buildQuestion(w, "synonym")
      || buildQuestion(w, "antonym");
    setQuestion(q); setSelected(null); setAidLog({}); setAiCoach(null);
    t0.current = Date.now();
  }, [idx, queue]);

  useEffect(() => {
    setElapsed(0);
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - t0.current) / 1000)), 500);
    return () => clearInterval(id);
  }, [idx]);

  const handleAid = (opt, type) => {
    setAidLog(prev => ({ ...prev, [opt]: { ...prev[opt], [type]: true } }));
  };

  const handleAnswer = async opt => {
    if (selected) return;
    const timeMs = Date.now() - t0.current;
    setCurrentTimeMs(timeMs);
    setSelected(opt);
    const isCorrect = opt === question.correct;
    const anyAid = Object.values(aidLog).some(a => Object.values(a).some(Boolean));

    setResults(r => [...r, { word: question.word, correct: isCorrect, type: question.type }]);
    setSessionLog(l => [...l, { word: question.word, questionType: question.type, correct: isCorrect, timeMs, aidUsed: anyAid, aids: aidLog }]);

    if (aiEnabled) {
      setAiLoading(true);
      try {
        const rootTip = ROOT_TIPS[question.word] || "";
        const sys = mode === "student"
          ? `You write 1–2 sentences max for a 10-year-old doing 11+ vocab practice. One memory trick or celebration — nothing else. Never use "however", "while", or compare words to each other. Always bake in a concrete example, e.g. "think of a still, silent lake for serene".${rootTip ? ` You have been given a memory hook — build your sentence around it, don't ignore it.` : ""}`
          : `You are an 11+ coaching analyst. Write EXACTLY 2 sentences: one observation on this specific answer (time taken, aids used, difficulty level), one teaching action. No waffle.`;
        const wordDef = WORD_MAP[question.word]?.simpleDefinition || WORD_MAP[question.word]?.definition || "";
        const wordExample = VOCAB_BANK.find(w => w.word === question.word)?.example || "";
        const user = isCorrect
          ? `Student got "${question.word}" RIGHT (${(timeMs/1000).toFixed(1)}s, aids=${anyAid}). Write one fun celebration sentence, max 10 words:\nSentence:`
          : `Student got "${question.word}" WRONG — chose "${opt}", correct="${question.correct}" (${wordDef}${wordExample ? `; example: "${wordExample}"` : ""}${rootTip ? `; memory hook: ${rootTip}` : ""}). Write one memory-trick sentence using a vivid image or analogy, max 15 words:\nSentence:`;
        const text = await callAI(user, sys);
        setAiCoach(text || "");
      } catch { setAiCoach(null); }
      setAiLoading(false);
    }
  };

  if (done || !queue.length) {
    const correct = results.filter(r => r.correct).length;
    const total = results.length;
    const pct = total ? Math.round(correct / total * 100) : 0;
    const totalMs = sessionLog.reduce((sum, r) => sum + (r.timeMs || 0), 0);
    const qpm = totalMs > 0 ? Math.round((total / (totalMs / 60000)) * 10) / 10 : 0;
    return (
      <div className="complete">
        <div className="complete-icon">{pct >= 80 ? "🌟" : pct >= 60 ? "💪" : "📖"}</div>
        <div className="complete-title">{pct >= 80 ? "Brilliant!" : pct >= 60 ? "Good effort!" : "Keep going!"}</div>
        <div className="complete-sub">{total} questions answered.</div>
        <div className="complete-stats">
          <div className={`cs ${pct >= 70 ? "good" : "warn"}`}><div className="val">{pct}%</div><div className="lbl">Score</div></div>
          <div className="cs good"><div className="val">{correct}</div><div className="lbl">Correct</div></div>
          <div className="cs warn"><div className="val">{total - correct}</div><div className="lbl">Review</div></div>
          <div className="cs"><div className="val">{qpm}</div><div className="lbl">Q/min</div></div>
        </div>
        <button className="next-btn" onClick={() => onSessionEnd(results, sessionLog)}>Save & finish</button>
      </div>
    );
  }

  if (!question) return null;
  const isCorrect = selected === question.correct;

  return (
    <>
      <div className="prog-wrap"><div className="prog-fill" style={{ width: `${idx / queue.length * 100}%` }} /></div>
      <div className="stats-row">
        <div className="stat-pill"><div className="val">{idx + 1}/{queue.length}</div><div className="lbl">Question</div></div>
        <div className="stat-pill good"><div className="val">{results.filter(r => r.correct).length}</div><div className="lbl">Correct</div></div>
        <div className="stat-pill warn"><div className="val">{results.filter(r => !r.correct).length}</div><div className="lbl">Review</div></div>
        <div className={`stat-pill ${elapsed < 20 ? "good" : elapsed <= 30 ? "warn" : "slow"}`}><div className="val">{selected ? "✓" : `${elapsed}s`}</div><div className="lbl">Time</div></div>
      </div>
      <div className="card">
        <div className="q-header">
          <div className="q-header-top">
            <div className="q-word">
              {question.type === "definition" ? "Which word fits this definition?" :
               question.type === "fillblank" ? "Fill in the blank" :
               question.word}
            </div>
            <div className={`q-badge badge-${question.type}`}>
              {question.type === "synonym" ? "Synonym" :
               question.type === "antonym" ? "Antonym" :
               question.type === "definition" ? "Definition" :
               "Fill blank"}
            </div>
          </div>
          {(question.type === "synonym" || question.type === "antonym") && (
            <QuestionAids word={question.word} aidLog={aidLog["__question"]} onAidUsed={(type) => handleAid("__question", type)} />
          )}
          <div className="q-prompt">
            {question.type === "synonym" && `Which word means the same as "${question.word}"?`}
            {question.type === "antonym" && `Which word is OPPOSITE in meaning to "${question.word}"?`}
            {question.type === "definition" && <span className="q-clue">{question.clue}</span>}
            {question.type === "fillblank" && <span className="q-clue">{question.clue}</span>}
          </div>
        </div>

        <div className="options-grid">
          {question.options.map(opt => (
            <OptionCard key={opt} opt={opt} selected={selected} correct={question.correct}
              answered={!!selected} onAnswer={handleAnswer} onAidUsed={handleAid} aidLog={aidLog[opt]} />
          ))}
        </div>

        {!selected && <div className="hint-row">Tap an answer — or use 🔊 📖 💡 on any option first</div>}

        {selected && (
          <>
            <div className={`result-block ${isCorrect ? "correct" : "wrong"}`}>
              <div className="result-icon">{isCorrect ? "✓" : "✗"}</div>
              <div className="result-title">{isCorrect ? "Correct!" : "Not quite."}</div>
              {!isCorrect && <div className="result-correct">The answer is: {question.correct}</div>}
              {(question.type === "definition" || question.type === "fillblank") && (
                <div className="result-word">"{question.word}" — {WORD_MAP[question.word]?.simpleDefinition}</div>
              )}
              <div className="result-eg">e.g. {WORD_MAP[question.word]?.example}</div>
              {currentTimeMs > 30000 && (
                <div className="slow-flag">⏱ {(currentTimeMs/1000).toFixed(0)}s — aim for under 30s on this one</div>
              )}
            </div>
            {aiEnabled && (aiLoading || aiCoach) && (
              <div className="ai-box">
                <div className="ai-label">✦ AI Coach</div>
                {aiLoading ? <div className="pulsing" style={{ opacity: 0.6, fontStyle: "italic" }}>Thinking...</div> : <div>{aiCoach}</div>}
              </div>
            )}
            <button className="next-btn" onClick={() => idx + 1 >= queue.length ? setDone(true) : setIdx(i => i + 1)}>
              {idx + 1 >= queue.length ? "See results →" : "Next word →"}
            </button>
          </>
        )}
      </div>
    </>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ leitnerBoxes, sessionHistory }) {
  const masteredCount = VOCAB_BANK.filter(w => isMastered(w, leitnerBoxes[w.word])).length;
  const totalPlaced = Object.keys(leitnerBoxes).length;
  const unseenCount = VOCAB_BANK.length - totalPlaced;
  const boxCounts = [0,1,2,3,4,5].map(b => Object.values(leitnerBoxes).filter(e => e.box === b).length);

  const allLogs = sessionHistory.flatMap(s => s.aidLog || []);
  const totalAnswers = allLogs.length;
  const aidedCount = allLogs.filter(r => r.aidUsed).length;
  const unaidedCorrect = allLogs.filter(r => r.correct && !r.aidUsed).length;

  const wordAidCount = {};
  allLogs.forEach(r => { if (r.aidUsed) wordAidCount[r.word] = (wordAidCount[r.word] || 0) + 1; });
  const needsWork = Object.entries(wordAidCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Timing metrics
  const timedLogs = allLogs.filter(r => r.timeMs > 0);
  const avgMs = timedLogs.length ? timedLogs.reduce((s, r) => s + r.timeMs, 0) / timedLogs.length : 0;
  const FORMAT_LABELS = { synonym:"Synonym", antonym:"Antonym", definition:"Definition", fillblank:"Fill blank" };
  const formatAvgs = Object.entries(FORMAT_LABELS).map(([fmt, label]) => {
    const fLogs = timedLogs.filter(r => r.questionType === fmt);
    const avg = fLogs.length ? fLogs.reduce((s, r) => s + r.timeMs, 0) / fLogs.length : null;
    return { fmt, label, avg, count: fLogs.length };
  }).filter(f => f.count > 0);
  const slowWordMap = {};
  timedLogs.forEach(r => { if (r.timeMs > 30000) slowWordMap[r.word] = (slowWordMap[r.word] || 0) + 1; });
  const slowWords = Object.entries(slowWordMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <>
      <div className="card">
        <div className="card-title">Baseline Assessment</div>
        <div className="card-sub">April 2026 mock · Target: 85%</div>
        <div className="info-grid">
          <div className="info-card"><div className="lbl">Overall</div><div className="val" style={{ fontFamily:"Fraunces,serif", fontSize:19, color:"var(--accent)" }}>54% <span style={{ fontSize:12, color:"var(--ink-soft)" }}>108/200</span></div></div>
          <div className="info-card"><div className="lbl">Gap to target</div><div className="val" style={{ fontFamily:"Fraunces,serif", fontSize:19, color:"var(--red)" }}>+31pp</div></div>
        </div>
        <div className="sec-label">By domain</div>
        {BASELINE.domains.map(d => (
          <div className="domain-row" key={d.name}>
            <div className="domain-name">{d.name}</div>
            <div className="bar-wrap"><div className="bar-fill" style={{ width:`${d.pct}%`, background: d.pct<50?"var(--red)":d.pct<65?"var(--gold)":"var(--green)" }} /></div>
            <div className="domain-pct" style={{ color: d.pct<50?"var(--red)":d.pct<65?"var(--gold)":"var(--green)" }}>{d.pct}%</div>
            <div className="domain-gap">+{d.gap}pp</div>
            <div className={`pbadge ${d.priority.toLowerCase()}`}>{d.priority}</div>
          </div>
        ))}
        <div style={{ marginTop:10, padding:"9px 11px", background:"var(--gold-soft)", borderRadius:7, fontSize:12, borderLeft:"3px solid var(--gold)" }}>
          <strong>Bexley:</strong> Verbal = 50% weight. Every 1% vocab gain counts double.
        </div>
      </div>

      <div className="card">
        <div className="card-title">Vocabulary Progress</div>
        <div className="card-sub">Leitner spaced repetition · {VOCAB_BANK.length} words in bank</div>
        <div className="leitner-grid">
          {[0,1,2,3,4,5].map(b => (
            <div className="lbox" key={b}>
              <div className="bnum">Box {b}</div>
              <div className="bcount">{b === 0 ? unseenCount + boxCounts[0] : boxCounts[b]}</div>
              <div className="blabel">{["New","Daily","3-day","Weekly","2-wk","Monthly"][b]}</div>
            </div>
          ))}
        </div>
        <div className="info-grid">
          <div className="info-card"><div className="lbl">Mastered (Box 3+)</div><div className="val" style={{ fontFamily:"Fraunces,serif", fontSize:18, color:"var(--green)" }}>{masteredCount}</div></div>
          <div className="info-card"><div className="lbl">Sessions done</div><div className="val" style={{ fontFamily:"Fraunces,serif", fontSize:18 }}>{sessionHistory.length}</div></div>
        </div>
        {totalPlaced > 0 && (
          <>
            <div className="sec-label">Format progress — words in progress</div>
            <div style={{ fontSize:10, color:"var(--ink-soft)", marginBottom:6 }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:3, marginRight:8 }}><span style={{ width:8, height:8, borderRadius:2, background:"var(--green)", display:"inline-block" }}></span>passed</span>
              <span style={{ display:"inline-flex", alignItems:"center", gap:3, marginRight:8 }}><span style={{ width:8, height:8, borderRadius:2, background:"var(--red-soft)", border:"1px solid var(--red)", display:"inline-block" }}></span>pending</span>
              <span style={{ display:"inline-flex", alignItems:"center", gap:3 }}><span style={{ width:8, height:8, borderRadius:2, background:"var(--border)", display:"inline-block" }}></span>N/A</span>
            </div>
            <div style={{ maxHeight:220, overflowY:"auto" }}>
              <table className="aids-table">
                <thead>
                  <tr>
                    <th>Word</th><th>Box</th>
                    <th style={{ textAlign:"center" }}>Syn</th>
                    <th style={{ textAlign:"center" }}>Ant</th>
                    <th style={{ textAlign:"center" }}>Def</th>
                    <th style={{ textAlign:"center" }}>Fill</th>
                  </tr>
                </thead>
                <tbody>
                  {VOCAB_BANK
                    .filter(w => leitnerBoxes[w.word])
                    .sort((a, b) => {
                      const ea = leitnerBoxes[a.word], eb = leitnerBoxes[b.word];
                      return eb.box - ea.box || a.word.localeCompare(b.word);
                    })
                    .map(w => {
                      const entry = leitnerBoxes[w.word];
                      const avail = availableFormats(w);
                      const seen = entry.formats || {};
                      const pip = (fmt) => {
                        if (!avail.includes(fmt)) return <span style={{ display:"inline-block", width:10, height:10, borderRadius:2, background:"var(--border)" }} />;
                        if (seen[fmt]) return <span style={{ display:"inline-block", width:10, height:10, borderRadius:2, background:"var(--green)" }} />;
                        return <span style={{ display:"inline-block", width:10, height:10, borderRadius:2, background:"var(--red-soft)", border:"1px solid var(--red)" }} />;
                      };
                      return (
                        <tr key={w.word}>
                          <td><strong>{w.word}</strong></td>
                          <td style={{ color: entry.box >= 3 ? "var(--green)" : "var(--ink-soft)" }}>B{entry.box}</td>
                          <td style={{ textAlign:"center" }}>{pip("synonym")}</td>
                          <td style={{ textAlign:"center" }}>{pip("antonym")}</td>
                          <td style={{ textAlign:"center" }}>{pip("definition")}</td>
                          <td style={{ textAlign:"center" }}>{pip("fillblank")}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {totalAnswers > 0 && (
        <div className="card">
          <div className="card-title">Aid Usage</div>
          <div className="card-sub">🔊 📖 💡 tracked silently — only shown here</div>
          <div className="info-grid">
            <div className="info-card">
              <div className="lbl">Unaided correct</div>
              <div className="val" style={{ fontFamily:"Fraunces,serif", fontSize:18, color:"var(--green)" }}>{Math.round(unaidedCorrect / totalAnswers * 100)}%</div>
            </div>
            <div className="info-card">
              <div className="lbl">Used an aid</div>
              <div className="val" style={{ fontFamily:"Fraunces,serif", fontSize:18, color:"var(--gold)" }}>{Math.round(aidedCount / totalAnswers * 100)}%</div>
            </div>
          </div>
          {needsWork.length > 0 && (
            <>
              <div className="sec-label">Words needing most help</div>
              <table className="aids-table">
                <thead><tr><th>Word</th><th>Times aided</th><th>Status</th></tr></thead>
                <tbody>
                  {needsWork.map(([word, count]) => {
                    const wordLogs = allLogs.filter(r => r.word === word);
                    const lastCorrect = wordLogs[wordLogs.length - 1]?.correct;
                    return (
                      <tr key={word}>
                        <td><strong>{word}</strong></td>
                        <td>{count}×</td>
                        <td><span className={`status-badge ${lastCorrect ? "s-aided" : "s-miss"}`}>{lastCorrect ? "Getting there" : "Needs work"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {timedLogs.length > 0 && (
        <div className="card">
          <div className="card-title">Timing</div>
          <div className="card-sub">Based on {timedLogs.length} timed answers</div>
          <div className="info-grid">
            <div className="info-card">
              <div className="lbl">Avg per question</div>
              <div className="val" style={{ fontFamily:"Fraunces,serif", fontSize:18, color: avgMs > 30000 ? "var(--red)" : avgMs > 20000 ? "var(--gold)" : "var(--green)" }}>{(avgMs/1000).toFixed(1)}s</div>
            </div>
            <div className="info-card">
              <div className="lbl">Slow (&gt;30s)</div>
              <div className="val" style={{ fontFamily:"Fraunces,serif", fontSize:18, color: slowWords.length > 0 ? "var(--red)" : "var(--green)" }}>{timedLogs.filter(r => r.timeMs > 30000).length}</div>
            </div>
          </div>
          {formatAvgs.length > 1 && (
            <>
              <div className="sec-label">Speed by format</div>
              <table className="aids-table">
                <thead><tr><th>Format</th><th>Avg time</th><th>Questions</th></tr></thead>
                <tbody>
                  {formatAvgs.sort((a,b) => b.avg - a.avg).map(f => (
                    <tr key={f.fmt}>
                      <td><strong>{f.label}</strong></td>
                      <td style={{ color: f.avg > 30000 ? "var(--red)" : f.avg > 20000 ? "var(--gold)" : "var(--green)", fontWeight:700 }}>{(f.avg/1000).toFixed(1)}s</td>
                      <td style={{ color:"var(--ink-soft)" }}>{f.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {slowWords.length > 0 && (
            <>
              <div className="sec-label">Words taking longest</div>
              <table className="aids-table">
                <thead><tr><th>Word</th><th>Times &gt;30s</th></tr></thead>
                <tbody>
                  {slowWords.map(([word, count]) => (
                    <tr key={word}>
                      <td><strong>{word}</strong></td>
                      <td style={{ color:"var(--red)" }}>{count}×</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-title">Phase Milestones</div>
        <div className="card-sub">April → September 2026</div>
        <div className="milestone-grid">
          {[
            { label:"End April", score:"60%", words:"40 words" },
            { label:"End May", score:"65%", words:"160 words" },
            { label:"End June", score:"70%", words:"200 words" },
            { label:"End July", score:"75%", words:"300 words" },
            { label:"Mid August", score:"80%", words:"380 words" },
            { label:"End August", score:"85%+", words:"400+ words" },
          ].map(m => (
            <div className="mc" key={m.label}>
              <div className="mdate">{m.label}</div>
              <div className="mscore">{m.score}</div>
              <div className="mwords">{m.words}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Weekly Schedule</div>
        <div className="card-sub">~3.5 hrs/week guided study</div>
        {[
          { day:"Mon", act:"Vocab flashcards + Maths speed drill", dur:"30 min" },
          { day:"Tue", act:"Comprehension or Cloze practice", dur:"25 min" },
          { day:"Wed", act:"NVR pattern practice", dur:"20 min" },
          { day:"Thu", act:"Vocab review + Shuffled Sentences", dur:"25 min" },
          { day:"Fri", act:"Timed section practice", dur:"30 min" },
          { day:"Sat", act:"Tutor session", dur:"60 min" },
          { day:"Sun", act:"Free reading + vocab game", dur:"20 min" },
        ].map(r => (
          <div className="sched-row" key={r.day}>
            <div className="sched-day">{r.day}</div>
            <div className="sched-act">{r.act}</div>
            <div className="sched-dur">{r.dur}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── COACH ADVISOR ────────────────────────────────────────────────────────────
function CoachAdvisor({ sessionHistory, leitnerBoxes }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const masteredCount = VOCAB_BANK.filter(w => isMastered(w, leitnerBoxes[w.word])).length;
  const allLogs = sessionHistory.flatMap(s => s.aidLog || []);
  const unaidedPct = allLogs.length ? Math.round(allLogs.filter(r => r.correct && !r.aidUsed).length / allLogs.length * 100) : null;
  const avgScore = sessionHistory.length ? Math.round(sessionHistory.reduce((s, r) => s + (r.correct / r.total) * 100, 0) / sessionHistory.length) : null;

  const sys = `Analytical 11+ coaching advisor for Dave, parent of a 10-year-old. Kent Test + Bexley Selection Test, September 2026.
STUDENT DATA: Baseline 54% (target 85%). Vocab 39% — P1 Critical. Maths 60% (79% untimed). NVR 58%. Words mastered: ${masteredCount}/${VOCAB_BANK.length}. Sessions: ${sessionHistory.length}. Avg score: ${avgScore ?? "none"}%. Unaided correct: ${unaidedPct ?? "no data"}%. Bexley: verbal 50% weight — vocab gains count double. Be direct, data-led, actionable.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); setInput("");
    setMessages(m => [...m, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const history = [...messages, { role: "user", content: msg }]
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");
      const text = await callAI(history, sys);
      setMessages(m => [...m, { role: "assistant", content: text || "Something went wrong." }]);
    } catch { setMessages(m => [...m, { role: "assistant", content: "Couldn't reach AI." }]); }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-title">Coach Advisor</div>
      <div className="card-sub">AI analysis using live progress + aid usage data</div>
      <div className="info-grid">
        <div className="info-card"><div className="lbl">Unaided correct</div><div className="val" style={{ fontFamily:"Fraunces,serif", fontSize:17, color:"var(--green)" }}>{unaidedPct ?? "—"}{unaidedPct != null ? "%" : ""}</div></div>
        <div className="info-card"><div className="lbl">Session avg</div><div className="val" style={{ fontFamily:"Fraunces,serif", fontSize:17 }}>{avgScore ?? "—"}{avgScore != null ? "%" : ""}</div></div>
      </div>
      {!messages.length && (
        <div className="quick-qs">
          {["Where should we focus this week?", "What does the aid data tell us?", "How do we fix timing?"].map(q => (
            <button key={q} className="quick-q" onClick={() => setInput(q)}>{q}</button>
          ))}
        </div>
      )}
      <div className="coach-msgs">
        {messages.map((m, i) => <div key={i} className={`coach-msg ${m.role === "user" ? "user" : "ai"}`}>{m.content}</div>)}
        {loading && <div className="coach-msg ai pulsing" style={{ opacity:0.6, fontStyle:"italic" }}>Analysing...</div>}
      </div>
      <div className="coach-input-wrap">
        <input className="coach-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about strategy, aid patterns, sessions..." />
        <button className="coach-send" onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  );
}

// ─── PROFILE CREATOR ─────────────────────────────────────────────────────────
function ProfileCreator({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(PROFILE_AVATARS[0]);
  const [colour, setColour] = useState(PROFILE_COLOURS[0]);
  return (
    <div className="creator-panel">
      <div className="creator-label">Name</div>
      <input
        className="creator-input"
        placeholder="Enter a name…"
        maxLength={20}
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
      />
      <div className="creator-label">Avatar</div>
      <div className="avatar-grid">
        {PROFILE_AVATARS.map(a => (
          <div key={a} className={`avatar-opt${avatar === a ? " sel" : ""}`} onClick={() => setAvatar(a)}>{a}</div>
        ))}
      </div>
      <div className="creator-label">Colour</div>
      <div className="colour-grid">
        {PROFILE_COLOURS.map(c => (
          <div key={c} className={`colour-opt${colour === c ? " sel" : ""}`} style={{ background: c }} onClick={() => setColour(c)} />
        ))}
      </div>
      <div className="creator-actions">
        <button className="creator-cancel" onClick={onCancel}>Cancel</button>
        <button
          className="creator-save"
          disabled={!name.trim()}
          onClick={() => onSave({ id: makeProfileId(), name: name.trim(), avatar, colour, createdAt: Date.now() })}
        >Create profile →</button>
      </div>
    </div>
  );
}

// ─── PROFILE SELECTOR ────────────────────────────────────────────────────────
function ProfileSelector({ profiles, activeProfileId, leitnerBoxes, onSelect, onCreateProfile, onClose }) {
  const [creating, setCreating] = useState(false);
  const handleSave = (newProfile) => {
    onCreateProfile(newProfile);
    setCreating(false);
  };
  return (
    <div className="profile-overlay" onClick={e => e.target === e.currentTarget && onClose && onClose()}>
      <div className="profile-panel">
        <button className="profile-close" onClick={onClose}>✕</button>
        <div className="profile-panel-title">{creating ? "New Profile" : "Profiles"}</div>
        <div className="profile-panel-sub">
          {creating ? "Who's this for?" : "Pick a profile to continue"}
        </div>
        {creating ? (
          <ProfileCreator onSave={handleSave} onCancel={() => setCreating(false)} />
        ) : (
          <>
            <div className="profile-list">
              {profiles.map(p => {
                const boxes = p.id === activeProfileId ? leitnerBoxes : {};
                const mastered = VOCAB_BANK.filter(w => isMastered(w, boxes[w.word])).length;
                const isActive = p.id === activeProfileId;
                return (
                  <div key={p.id} className={`profile-card${isActive ? " active" : ""}`} onClick={() => onSelect(p)}>
                    <div className="pc-avatar">{p.avatar}</div>
                    <div>
                      <div className="pc-name">{p.name}</div>
                      <div className="pc-stats">{isActive ? `${mastered} words mastered` : "Tap to switch"}</div>
                    </div>
                    {isActive && <div className="pc-check">✓</div>}
                  </div>
                );
              })}
            </div>
            <button className="add-profile-btn" onClick={() => setCreating(true)}>+ Add profile</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState("student");
  const [tab, setTab] = useState("practice");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [leitnerBoxes, setLeitnerBoxes] = useState({});
  const [sessionHistory, setSessionHistory] = useState([]);
  const [streak, setStreak] = useState({ count: 0, lastDate: null });
  const [practising, setPractising] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // v1.6 profiles
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [showProfileSelect, setShowProfileSelect] = useState(false);

  // Load user data for a given profile
  const loadUserData = async (prof) => {
    const keys = getUserStorageKeys(prof.id);
    const boxes   = await storageGet(keys.leitnerBoxes)   || {};
    const history = await storageGet(keys.sessionHistory) || [];
    const streakData = await storageGet(keys.streakData)  || { count: 0, lastDate: null };
    setLeitnerBoxes(boxes);
    setSessionHistory(history);
    setStreak(streakData);
  };

  useEffect(() => {
    (async () => {
      // Load or initialise profiles
      let profs = await storageGet(PROFILES_KEY) || [];
      let activeId = await storageGet(ACTIVE_PROFILE_KEY);

      if (profs.length === 0) {
        // First launch — migrate any existing flat-key data to a default profile
        const defaultId = makeProfileId();
        const defaultProfile = { id: defaultId, name: "My Profile", avatar: "🦁", colour: "#e85d26", createdAt: Date.now() };
        // Migrate existing data (if any)
        const existingBoxes   = await storageGet(STORAGE_KEYS.leitnerBoxes);
        const existingHistory = await storageGet(STORAGE_KEYS.sessionHistory);
        const existingStreak  = await storageGet(STORAGE_KEYS.streakData);
        const userKeys = getUserStorageKeys(defaultId);
        if (existingBoxes)   await storageSet(userKeys.leitnerBoxes,   existingBoxes);
        if (existingHistory) await storageSet(userKeys.sessionHistory, existingHistory);
        if (existingStreak)  await storageSet(userKeys.streakData,     existingStreak);
        profs = [defaultProfile];
        activeId = defaultId;
        await storageSet(PROFILES_KEY, profs);
        await storageSet(ACTIVE_PROFILE_KEY, activeId);
      }

      const activeProfile = profs.find(p => p.id === activeId) || profs[0];
      setProfiles(profs);
      setProfile(activeProfile);
      await loadUserData(activeProfile);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { setTab(mode === "student" ? "practice" : "dashboard"); setPractising(false); }, [mode]);

  const handleSessionEnd = async (results, aidLog) => {
    const correct = results.filter(r => r.correct).length;
    const newBoxes = { ...leitnerBoxes };
    results.forEach(r => {
      const cur = newBoxes[r.word] || { box: 0, lastSeen: 0, formats: {} };
      const newFormats = { ...(cur.formats || {}) };
      if (r.correct) newFormats[r.type] = Date.now();
      newBoxes[r.word] = {
        box: r.correct ? Math.min(cur.box + 1, 5) : 0,
        lastSeen: Date.now(),
        formats: r.correct ? newFormats : {}, // wrong answer resets format progress too
      };
    });
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = { count: streak.lastDate === yesterday ? streak.count + 1 : streak.lastDate === today ? streak.count : 1, lastDate: today };
    const newHistory = [...sessionHistory, { date: Date.now(), correct, total: results.length, aidLog }];
    setLeitnerBoxes(newBoxes); setStreak(newStreak); setSessionHistory(newHistory);
    const userKeys = getUserStorageKeys(profile.id);
    await storageSet(userKeys.leitnerBoxes,   newBoxes);
    await storageSet(userKeys.streakData,     newStreak);
    await storageSet(userKeys.sessionHistory, newHistory);
    setPractising(false);
  };

  const handleSwitchProfile = async (newProfile) => {
    setLoaded(false);
    setLeitnerBoxes({});
    setSessionHistory([]);
    setStreak({ count: 0, lastDate: null });
    setPractising(false);
    setProfile(newProfile);
    await storageSet(ACTIVE_PROFILE_KEY, newProfile.id);
    await loadUserData(newProfile);
    setLoaded(true);
    setShowProfileSelect(false);
  };

  const handleCreateProfile = async (newProfile) => {
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    await storageSet(PROFILES_KEY, updatedProfiles);
    await handleSwitchProfile(newProfile);
  };

  const dueCount = loaded ? getDueWords(leitnerBoxes).length : 0;
  const masteredCount = VOCAB_BANK.filter(w => isMastered(w, leitnerBoxes[w.word])).length;
  const todayDone = streak.lastDate === new Date().toDateString();
  const sTabs = [{ id:"practice", label:"Practice" }, { id:"dashboard", label:"Progress" }];
  const cTabs = [{ id:"dashboard", label:"Dashboard" }, { id:"advisor", label:"AI Advisor" }];

  return (
    <div className="app">
      <style>{css}</style>
      <div className="header">
        <div className="logo">11<span>+</span> Coach <span className="ver">v{VERSION}</span></div>
        <div className="hdr-right">
          <div className={`ai-pill ${aiEnabled ? "on" : "off"}`} onClick={() => setAiEnabled(e => !e)}>
            <div className="ai-dot" /> AI {aiEnabled ? "on" : "off"}
          </div>
          {profile && (
            <div className="profile-pill" onClick={() => setShowProfileSelect(true)} title="Switch profile">
              <span className="p-avatar">{profile.avatar}</span>
              <span className="p-name">{profile.name}</span>
            </div>
          )}
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === "student" ? "active" : ""}`} onClick={() => setMode("student")}>Student</button>
            <button className={`mode-btn ${mode === "coach" ? "active" : ""}`} onClick={() => setMode("coach")}>Coach</button>
          </div>
        </div>
      </div>

      {showProfileSelect && (
        <ProfileSelector
          profiles={profiles}
          activeProfileId={profile?.id}
          leitnerBoxes={leitnerBoxes}
          onSelect={handleSwitchProfile}
          onCreateProfile={handleCreateProfile}
          onClose={() => setShowProfileSelect(false)}
        />
      )}

      <div className="nav">
        {(mode === "student" ? sTabs : cTabs).map(t => (
          <button key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => { setTab(t.id); setPractising(false); }}>{t.label}</button>
        ))}
      </div>

      <div className="main">
        {!loaded ? (
          <div className="empty-state"><div className="empty-icon pulsing">📚</div><div className="empty-title">Loading...</div></div>
        ) : tab === "practice" && mode === "student" ? (
          practising ? (
            <VocabSession leitnerBoxes={leitnerBoxes} onSessionEnd={handleSessionEnd} aiEnabled={aiEnabled} mode={mode} />
          ) : (
            <>
              {streak.count >= 2 && <div className="streak-banner">🔥 {streak.count}-day streak — keep it up!</div>}
              <div className="card">
                <div className="card-title">Word Practice</div>
                <div className="card-sub">Synonyms and antonyms — your most important area right now</div>
                <div className="stats-row">
                  <div className="stat-pill good"><div className="val">{masteredCount}</div><div className="lbl">Mastered</div></div>
                  <div className="stat-pill warn"><div className="val">{dueCount}</div><div className="lbl">Due now</div></div>
                  <div className="stat-pill"><div className="val">{VOCAB_BANK.length}</div><div className="lbl">In bank</div></div>
                </div>
                <div style={{ padding:"9px 11px", background:"var(--cream)", borderRadius:7, fontSize:13, marginBottom:14, lineHeight:1.6 }}>
                  {!dueCount ? "All caught up! Come back tomorrow for new words." :
                   todayDone ? "Great work today! Go again to keep the streak alive. 🎯" :
                   `${dueCount} words ready. Use 🔊 to hear, 📖 for the meaning, 💡 for a simple hint — then pick your answer.`}
                </div>
                <button className="action-btn" onClick={() => dueCount && setPractising(true)} disabled={!dueCount}>
                  {dueCount ? `Start session (${dueCount} words) →` : "No words due — check back tomorrow"}
                </button>
              </div>
              {sessionHistory.length > 0 && (
                <div className="card">
                  <div className="card-title" style={{ fontSize:15 }}>Recent Sessions</div>
                  {sessionHistory.slice(-4).reverse().map((s, i) => (
                    <div key={i} className="domain-row">
                      <div className="domain-name" style={{ fontSize:11 }}>{new Date(s.date).toLocaleDateString("en-GB")}</div>
                      <div className="bar-wrap"><div className="bar-fill" style={{ width:`${Math.round(s.correct/s.total*100)}%`, background: s.correct/s.total>=0.7?"var(--green)":"var(--gold)" }} /></div>
                      <div className="domain-pct">{Math.round(s.correct/s.total*100)}%</div>
                      <div className="domain-gap">{s.correct}/{s.total}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )
        ) : tab === "dashboard" ? (
          <Dashboard leitnerBoxes={leitnerBoxes} sessionHistory={sessionHistory} />
        ) : tab === "advisor" ? (
          <CoachAdvisor sessionHistory={sessionHistory} leitnerBoxes={leitnerBoxes} />
        ) : null}
      </div>
    </div>
  );
}
