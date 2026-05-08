// Heuristic AI-text scorer. Pure functions, no IO. Returns a rating in [0, 1]
// plus a list of signals so the device readout can explain itself if needed.
//
// The list is biased toward the markers that actually correlate with current
// LLM output (mid-2026 GPT/Claude/Gemini families). Update over time.

// =============================================================================
// Vocabulary markers — words/phrases LLMs reach for far more than humans do.
// Grouped only for readability; all are scanned together.
// =============================================================================

const VOCAB_MARKERS: RegExp[] = [
  // The classic slop
  /\bdelve(?:s|d|ing)?\b/gi,
  /\btapestry\b/gi,
  /\bnavigate(?:s|d|ing)?\b/gi,
  /\bboasts?\b/gi,
  /\bunderscores?\b/gi,
  /\btestament to\b/gi,
  /\brobust\b/gi,
  /\bleverage(?:s|d|ing)?\b/gi,
  /\bsynerg(?:y|ies|istic)\b/gi,
  /\bseamless(?:ly)?\b/gi,
  /\bgame[\s-]?chang(?:er|ing)\b/gi,
  /\bunlock(?:s|ed|ing)?\b/gi,
  /\bharness(?:es|ed|ing)?\b/gi,
  /\bembark(?:s|ed|ing)?\b/gi,
  /\brealm\b/gi,
  /\bintricate(?:ly)?\b/gi,
  /\bnuanced?\b/gi,
  /\bmultifaceted\b/gi,
  /\bcomprehensive(?:ly)?\b/gi,
  /\bintricac(?:y|ies)\b/gi,
  /\bplethora\b/gi,
  /\bmyriad\b/gi,
  /\bpivotal\b/gi,
  /\binvaluable\b/gi,
  /\bparamount\b/gi,
  /\befficac(?:y|ious)\b/gi,
  /\bholistic(?:ally)?\b/gi,
  /\bmeticulous(?:ly)?\b/gi,
  /\bweav(?:e|es|ed|ing) (?:a |the )?\w*\s*(?:tapestry|fabric|story|narrative)\b/gi,
  /\bdeep dive\b/gi,
  /\bdive deep\b/gi,
  /\benthusiast\b/gi,
  /\bever[\s-]evolving\b/gi,
  /\bcutting[\s-]edge\b/gi,
  /\bstate[\s-]of[\s-]the[\s-]art\b/gi,
  /\bparadigm\b/gi,

  // Transformation / disruption
  /\btransformat(?:ive|ion|ional)\b/gi,
  /\bgroundbreaking\b/gi,
  /\brevolutioni[sz](?:e|es|ed|ing)\b/gi,
  /\brevolutionary\b/gi,
  /\bdisrupt(?:s|ed|ing|ive|ion)?\b/gi,
  /\bempower(?:s|ed|ing|ment)?\b/gi,
  /\belevat(?:e|es|ed|ing)\b/gi,
  /\boptimi[sz](?:e|es|ed|ing|ation)\b/gi,
  /\bstreamlin(?:e|es|ed|ing)\b/gi,
  /\breshap(?:e|es|ed|ing)\b/gi,
  /\bredefin(?:e|es|ed|ing)\b/gi,
  /\breimagin(?:e|es|ed|ing)\b/gi,
  /\baccelerat(?:e|es|ed|ing)\b/gi,
  /\bamplif(?:y|ies|ied|ying)\b/gi,
  /\baugment(?:s|ed|ing|ation)?\b/gi,
  /\bcataly(?:ze|zes|zed|zing|st)\b/gi,
  /\bfacilitat(?:e|es|ed|ing)\b/gi,
  /\bpropel(?:s|led|ling)?\b/gi,
  /\bspearhead(?:s|ed|ing)?\b/gi,
  /\bfoster(?:s|ed|ing)?\b/gi,

  // Abstract / philosophical filler
  /\b(?:journey|odyssey|voyage|expedition)\b/gi,
  /\b(?:frontier|horizon|trajectory)\b/gi,
  /\b(?:kaleidoscope|symphony|orchestration)\b/gi,
  /\b(?:hallmark|cornerstone|linchpin|keystone|bedrock)\b/gi,
  /\b(?:blueprint|scaffold|framework|architecture)\b/gi,
  /\b(?:ecosystem|landscape|terrain|milieu|zeitgeist)\b/gi,
  /\b(?:nexus|confluence|amalgam(?:ation)?)\b/gi,
  /\bmosaic\b/gi,
  /\bfabric of\b/gi,
  /\b(?:cusp|threshold|watershed|inflection point)\b/gi,
  /\b(?:beacon|lodestar|north star|guiding light)\b/gi,

  // Transition / hedge words (LLMs love these as sentence openers)
  /\bindeed\b/gi,
  /\btruly\b/gi,
  /\bgenuinely\b/gi,
  /\bprofoundly\b/gi,
  /\bfundamentally\b/gi,
  /\binherently\b/gi,
  /\bintrinsically\b/gi,
  /\bessentially\b/gi,
  /\bultimately\b/gi,
  /\bmoreover\b/gi,
  /\bfurthermore\b/gi,
  /\bnevertheless\b/gi,
  /\bnonetheless\b/gi,
  /\bconversely\b/gi,
  /\bnotably\b/gi,
  /\bsignificantly\b/gi,
  /\bcrucial(?:ly)?\b/gi,
  /\bnoteworthy\b/gi,
  /\bremarkably\b/gi,

  // Aspirational nouns / business poetry
  /\baspiration(?:s|al)?\b/gi,
  /\bvision(?:ary|aries)\b/gi,
  /\bpioneer(?:s|ed|ing)?\b/gi,
  /\btrailblaz(?:er|ers|ing)\b/gi,
  /\bvanguard\b/gi,
  /\binnovat(?:e|es|ed|ing|ive|or|ors|ion)\b/gi,
  /\bbespoke\b/gi,
  /\bcurated\b/gi,
  /\bartisan(?:al)?\b/gi,
  /\belevated\b/gi,
  /\bunparalleled\b/gi,
  /\bunprecedented\b/gi,

  // LinkedIn / coach-speak / "AI essay" lexicon
  /\bcommoditi[sz](?:e|es|ed|ing|ation)\b/gi,
  /\bconsciousness\b/gi,
  /\bself[\s-]?aware(?:ness)?\b/gi,
  /\bblind[\s-]?spots?\b/gi,
  /\bsuppressed emotions?\b/gi,
  /\bdeepest truth\b/gi,
  /\bauthentic(?:ity|ally)?\b/gi,
  /\balignment\b/gi,
  /\bembod(?:y|ied|iment|ying)\b/gi,
  /\bgrounded\b/gi,
  /\bpresence\b/gi,
  /\bintention(?:al|ality|ally)?\b/gi,
  /\bmindful(?:ness|ly)?\b/gi,

  // Brain-rot / Gen-Alpha slop lexicon (engagement-bait & bots-pretending-young)
  /\bskibidi\b/gi,
  /\b(?:rizz|rizzler|rizzed)\b/gi,
  /\bgyat?t\b/gi,
  /\bsigma\b/gi,
  /\bohio\b/gi,
  /\bfanum tax\b/gi,
  /\bmew(?:ing)?\b/gi,
  /\bmog(?:ged|ging|s)?\b/gi,
  /\blooks?[\s-]?max(?:x?ing|ed)?\b/gi,
  /\bgigachad\b/gi,
  /\bgooning?\b/gi,
  /\bcooked\b/gi,
  /\bchopped\b/gi,
  /\bglaz(?:e|ed|ing)\b/gi,
  /\bdelulu\b/gi,
  /\baura (?:points?|farming)\b/gi,
  /\b(?:no )?cap(?:ping)?\b/gi,
  /\bbussin'?\b/gi,
  /\bfr fr\b/gi,
  /\bon god\b/gi,
  /\b(?:lowkey|highkey)\b/gi,
  /\bslay(?:ed|ing)?\b/gi,
  /\bate (?:and left no crumbs|that)\b/gi,
  /\bbabygirl\b/gi,
  /\bpookie\b/gi,
  /\bbestie\b/gi,
  /\bit'?s giving\b/gi,
  /\bthe ick\b/gi,
  /\bmain character\b/gi,
  /\bcanon event\b/gi,
  /\b(?:hu|tu)zz\b/gi,
  /\boomf\b/gi,
  /\bnpc\b/gi,
  /\bratio(?:'?d)?\b/gi,
  /\btook (?:a |an |the )?L\b/g,
  /\b(?:big|huge) W\b/g,
  /\bbased\b/gi,
  /\bcope\b/gi,
  /\bseeth(?:e|ing)\b/gi,
  /\bmald(?:ing)?\b/gi
]

// =============================================================================
// Multi-word phrase markers — high-signal, count fully
// =============================================================================

const PHRASE_MARKERS: RegExp[] = [
  /\bit'?s worth (?:noting|mentioning|remembering)\b/gi,
  /\bit'?s important to (?:note|remember|understand|recognize|consider)\b/gi,
  /\b(?:keep|bear) in mind\b/gi,
  /\bthat (?:being )?said\b/gi,
  /\bon the other hand\b/gi,
  /\bin (?:contrast|essence|conclusion|summary)\b/gi,
  /\bat (?:its|the) (?:core|heart)\b/gi,
  /\bat the heart of\b/gi,
  /\bin a nutshell\b/gi,
  /\bto put it simply\b/gi,
  /\bsimply put\b/gi,
  /\bat the end of the day\b/gi,
  /\ball things considered\b/gi,
  /\bwhen all is said and done\b/gi,
  /\blook no further\b/gi,
  /\bwhether you'?re\b/gi,
  /\bwhether it'?s\b/gi,
  /\bimagine a (?:world|scenario|future)\b/gi,
  /\bpicture this\b/gi,
  /\bconsider this\b/gi,
  /\bthink about it\b/gi,
  /\bhave you ever wondered\b/gi,
  /\bwe live in (?:a |an |the )?\w+\s+(?:world|era|age|society)\b/gi,
  /\bin (?:our|today'?s) increasingly\b/gi,
  // Coach / "consciousness" / AI-essay phrasings
  /\bin real time\b/gi,
  /\bwhat actually matters\b/gi,
  /\bwhat doesn'?t \w+\b/gi,
  /\bis about to be\b/gi,
  /\bsit with (?:everything|something|the|your|yourself|it|that|this)\b/gi,
  /\bspend (?:a lot of |more |)time with (?:yourself|ourselves)\b/gi,
  /\bthe game (?:has been|is|was)\b/gi,
  /\bfor the (?:last|past) (?:hundreds?|thousands?|\d+)\s+(?:of\s+)?years\b/gi,
  /\bi think (?:it'?s|we|that|this|the)\b/gi,
  /\bmost people (?:i know|don'?t)\b/gi,
  /\bbuilt (?:your|their|our|my|his|her) whole identity\b/gi,
  /\bsmart(?:est)? (?:person|one) in the room\b/gi,
  /\b(?:we'?re|we are) entering (?:a |an |the )?\w*\s*era\b/gi
]

// =============================================================================
// Pattern markers — structural / grammatical AI tells
// =============================================================================

const NOT_JUST_X_ITS_Y =
  /\b(?:it'?s|that'?s|this is|here'?s) not (?:just|simply|merely|only)\s+[^,.!?\n]{2,40}[,.;]?\s+(?:it'?s|that'?s|this is|here'?s)\s+/gi
const I_DONT_JUST_X =
  /\b(?:i|you|we|they) (?:don'?t|do not) (?:just|simply|merely|only)\s+[^,.!?\n]{2,40}[,.;]?\s+(?:i|you|we|they)\s+/gi
const NOT_X_BUT_Y =
  /\bnot (?:just|simply|merely|only) (?:a |an |the )?\w+(?:\s+\w+){0,3}\s+but (?:also|rather)\s+(?:a |an |the )?\w+/gi

const GENERIC_OPENERS: RegExp[] = [
  /^\s*in today'?s fast[\s-]paced/i,
  /^\s*in today'?s (?:digital|modern|complex|interconnected|ever[\s-]evolving|rapidly|hyperconnected|globali[sz]ed)/i,
  /^\s*in (?:the|a) (?:realm|world|landscape|era|age) of/i,
  /^\s*in an (?:age|era|increasingly)/i,
  /^\s*as we (?:navigate|move|continue|delve|venture|step|enter)/i,
  /^\s*at (?:its|the) (?:core|heart)/i,
  /^\s*it'?s (?:no secret|important to (?:note|remember))/i,
  /^\s*let'?s (?:dive|delve|explore|unpack|unwrap)/i,
  /^\s*welcome to the (?:world|future|era) of/i,
  /^\s*in recent (?:years|times|months)/i,
  /^\s*we'?re entering /i,
  /^\s*we are entering /i,
  /^\s*first (?:the|a|an)\s+\w+/i,
  /^\s*for the (?:last|past) /i
]

// Sentence-starting transition words — LLMs over-use these as paragraph openers
const TRANSITION_OPENERS = [
  "however",
  "moreover",
  "furthermore",
  "additionally",
  "consequently",
  "therefore",
  "thus",
  "hence",
  "accordingly",
  "subsequently",
  "nevertheless",
  "nonetheless",
  "indeed",
  "notably",
  "importantly",
  "significantly",
  "ultimately",
  "essentially",
  "fundamentally"
]

const HUMBLE_BRAG =
  /\b(?:humbled|grateful|honored|blessed|thrilled|proud to (?:announce|share))\b/gi
const NUMBERED_INSIGHT =
  /\b\d+\s+(?:things?|lessons?|insights?|takeaways?|tips?|reasons?|ways?|truths?|principles?|rules?|secrets?|signs?)\s+(?:i\s+)?(?:learned|from|to|about|for|that|why)\b/i
const CTA =
  /\b(?:what'?s your take|drop a comment|let me know in the comments?|share your thoughts|thoughts\??$|agree\??$|am i wrong\??|curious what you think|curious to hear|what (?:do|would) you think)/i
const GENERIC_CONCLUSION =
  /\b(?:future is bright|just the beginning|sky'?s the limit|next level|change the world|stay tuned|trust the process|onward and upward|together we|the rest is history)\b/gi

const ANY_EMOJI = /\p{Extended_Pictographic}/gu
const HASHTAG = /(?:^|\s)#\w+/g
const ELLIPSIS = /…|\.{3,}/g
// "First the X. Then the Y. And now Z." escalation hook
const FIRST_THEN_NOW =
  /\bfirst\b[^.!?\n]{3,80}[.!?]\s+then\b[^.!?\n]{3,80}[.!?]\s+(?:and\s+)?now\b/i

// Words that don't count for anaphora detection (too common to be meaningful)
const ANAPHORA_STOPWORDS = new Set([
  "the", "a", "an", "and", "but", "or", "so", "i", "we", "you", "it",
  "this", "that", "they", "he", "she", "in", "on", "of", "to", "for",
  "with", "from", "as", "by", "is", "was", "are", "were", "be", "been"
])

// "X, Y, and Z" rule-of-three with 1-3 word items, used to detect AI list-style
const RULE_OF_THREE =
  /\b(\w+(?:\s\w+){0,2}),\s+(\w+(?:\s\w+){0,2}),?\s+and\s+(\w+(?:\s\w+){0,2})\b/g

// Bold-headers pattern: **text** at start of line — typical of LLM markdown
const BOLD_HEADER = /^\s*\*\*[^*\n]{2,40}\*\*\s*[:\n]/gm

// Bullet lines starting with emojis or arrows
const EMOJI_BULLETS =
  /^\s*(?:[•→✨🚀💡🎯⚡🔥📈🌟✅\u{1F539}\u{1F538}]|\*|-)\s+\S/gmu

// =============================================================================

export type TextScore = {
  rating: number
  signals: string[]
}

export function scoreText(raw: string): TextScore {
  const signals: string[] = []
  if (!raw) return { rating: 0, signals }
  const text = raw.trim()
  if (text.length < 20) return { rating: 0, signals }

  let score = 0
  const words = text.split(/\s+/)
  const wc = words.length || 1

  // --- Vocabulary markers (per 100-word rate)
  let vocabHits = 0
  const matchedVocab: string[] = []
  for (const re of VOCAB_MARKERS) {
    const matches = text.match(re)
    if (matches) {
      vocabHits += matches.length
      if (matchedVocab.length < 5) matchedVocab.push(matches[0].toLowerCase())
    }
  }
  const vocabRate = (vocabHits / wc) * 100
  if (vocabRate >= 0.2) {
    score += Math.min(0.55, vocabRate * 0.22)
    signals.push(
      `vocab: ${matchedVocab.slice(0, 4).join(", ")}${
        vocabHits > 4 ? ` (+${vocabHits - 4})` : ""
      }`
    )
  }

  // --- Phrase markers
  let phraseHits = 0
  const matchedPhrases: string[] = []
  for (const re of PHRASE_MARKERS) {
    const matches = text.match(re)
    if (matches) {
      phraseHits += matches.length
      if (matchedPhrases.length < 3)
        matchedPhrases.push(matches[0].slice(0, 30).toLowerCase())
    }
  }
  if (phraseHits >= 1) {
    score += Math.min(0.40, phraseHits * 0.14)
    signals.push(`AI phrases: ${matchedPhrases.join("; ")}`)
  }

  // --- Em-dashes (LLMs love them)
  const emDashes = (text.match(/—/g) || []).length
  const emDashRate = (emDashes / wc) * 100
  if (emDashRate >= 0.2) {
    score += Math.min(0.32, emDashRate * 0.20)
    signals.push(`em-dashes ×${emDashes}`)
  }

  // --- Pattern constructions
  if (NOT_JUST_X_ITS_Y.test(text)) {
    score += 0.30
    signals.push("not-just-X-it's-Y")
  }
  if (I_DONT_JUST_X.test(text)) {
    score += 0.30
    signals.push("don't-just-X-Y")
  }
  if (NOT_X_BUT_Y.test(text)) {
    score += 0.18
    signals.push("not-just-X-but-Y")
  }

  // --- Generic openers
  for (const re of GENERIC_OPENERS) {
    if (re.test(text)) {
      score += 0.30
      signals.push("generic LLM opener")
      break
    }
  }

  // --- Transition openers at sentence boundaries
  let transitionHits = 0
  for (const word of TRANSITION_OPENERS) {
    const re = new RegExp(`(?:^|[.!?]\\s+)${word},`, "gi")
    const matches = text.match(re)
    if (matches) transitionHits += matches.length
  }
  if (transitionHits >= 1) {
    score += Math.min(0.25, transitionHits * 0.10)
    signals.push(`transition openers ×${transitionHits}`)
  }

  // --- Sentence-shaped specifics
  if (NUMBERED_INSIGHT.test(text)) {
    score += 0.18
    signals.push("numbered insights")
  }
  if (HUMBLE_BRAG.test(text)) {
    score += 0.12
    signals.push("humble-brag")
  }
  if (CTA.test(text)) {
    score += 0.12
    signals.push("LinkedIn-style CTA")
  }
  if (GENERIC_CONCLUSION.test(text)) {
    score += 0.12
    signals.push("generic conclusion")
  }

  // --- Markdown / formatting tells
  const boldHeaders = (text.match(BOLD_HEADER) || []).length
  if (boldHeaders >= 1) {
    score += Math.min(0.20, boldHeaders * 0.12)
    signals.push(`**bold** headers ×${boldHeaders}`)
  }
  const emojiBullets = (text.match(EMOJI_BULLETS) || []).length
  if (emojiBullets >= 2) {
    score += Math.min(0.25, emojiBullets * 0.07)
    signals.push(`emoji bullets ×${emojiBullets}`)
  }

  // --- Emoji density
  const emojis = text.match(ANY_EMOJI) || []
  if (emojis.length >= 2) {
    score += Math.min(0.30, (emojis.length - 1) * 0.08)
    signals.push(`emojis ×${emojis.length}`)
  }

  // --- Hashtag density
  const hashtags = text.match(HASHTAG) || []
  if (hashtags.length >= 2) {
    score += Math.min(0.20, (hashtags.length - 1) * 0.06)
    signals.push(`hashtags ×${hashtags.length}`)
  }

  // --- Rule-of-three constructions ("X, Y, and Z")
  const ruleOfThree = (text.match(RULE_OF_THREE) || []).length
  const r3Rate = (ruleOfThree / wc) * 100
  if (r3Rate >= 0.4 && ruleOfThree >= 2) {
    score += Math.min(0.18, r3Rate * 0.08)
    signals.push(`rule-of-three ×${ruleOfThree}`)
  }

  // --- Ellipses (LLMs love trailing ellipses for "dramatic pause")
  const ellipses = (text.match(ELLIPSIS) || []).length
  if (ellipses >= 1) {
    score += Math.min(0.18, ellipses * 0.10)
    signals.push(`ellipses ×${ellipses}`)
  }

  // --- "First X. Then Y. And now Z." escalation hook
  if (FIRST_THEN_NOW.test(text)) {
    score += 0.30
    signals.push("first/then/now hook")
  }

  // --- Sentence-shaped analysis
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 5)

  // --- Anaphora: 3+ consecutive-style sentences starting with the same word.
  // Catches "Whether... Whether... Whether..." / "First... Then... Now..."
  if (sentences.length >= 3) {
    const counts: Record<string, number> = {}
    for (const s of sentences) {
      const first = s
        .replace(/^[\s"'“"]+/, "")
        .split(/\s+/)[0]
        ?.toLowerCase()
        .replace(/[^\w']/g, "")
      if (!first || first.length < 3) continue
      if (ANAPHORA_STOPWORDS.has(first)) continue
      counts[first] = (counts[first] || 0) + 1
    }
    let bestWord = ""
    let bestCount = 0
    for (const w in counts) {
      if (counts[w] > bestCount) {
        bestCount = counts[w]
        bestWord = w
      }
    }
    if (bestCount >= 3) {
      score += Math.min(0.35, bestCount * 0.12)
      signals.push(`anaphora "${bestWord}…" ×${bestCount}`)
    }
  }

  // --- Many short punchy sentences (LinkedIn / engagement-bait formatting)
  if (sentences.length >= 6) {
    const short = sentences.filter((s) => s.split(/\s+/).length <= 8).length
    const ratio = short / sentences.length
    if (ratio >= 0.4) {
      score += Math.min(0.20, ratio * 0.30)
      signals.push(`short sentences ${Math.round(ratio * 100)}%`)
    }
  }

  // --- Sentence-length uniformity (LLMs cluster around 12-18 words)
  if (sentences.length >= 4) {
    const lens = sentences.map((s) => s.split(/\s+/).length)
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length
    const variance =
      lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length
    const sd = Math.sqrt(variance)
    const cv = sd / mean
    if (mean >= 6 && cv < 0.40) {
      const inc = Math.min(0.25, (0.40 - cv) * 1.2)
      score += inc
      signals.push(
        `uniform sentences (μ=${mean.toFixed(1)}, cv=${cv.toFixed(2)})`
      )
    }
  }

  // Floor for any scoreable text so the verdict always lights the overlay,
  // even on clearly-human passages (low rating reads as green).
  const rating = Math.max(0.05, Math.min(1, score))
  return { rating, signals }
}
