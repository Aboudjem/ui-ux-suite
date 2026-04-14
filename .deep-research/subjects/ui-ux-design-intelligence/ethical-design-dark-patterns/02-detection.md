# Automated Dark Pattern Detection

## Current State

Detection tools cover only **45.5%** of known dark pattern types (31 of 68). The remaining 54.5% are undetectable by any current automated system.

## Detection Approaches

### Computer Vision
- **UIGuard**: Knowledge-driven system using CV + NLP pattern matching. Micro-F1 = 0.79 on 14 dark pattern subtypes across 1,660 annotated app screens.
- **AppRay**: Detects 18 pattern types (dynamic + static). Micro-F1 = 0.76 on 2,185 labeled samples.
- **YOLOv12x**: Real-time object recognition for visual dark patterns in UI screenshots.

### Natural Language Processing
- **BERT/DistilBERT**: Text-based detection of deceptive language in e-commerce interfaces. Bidirectional encoding captures contextual deception.
- **EasyOCR + DistilBERT**: Combined OCR text extraction with transformer classification.

### DOM/Structural Analysis
- Structural patterns detected via DOM inspection (hidden elements, misleading hierarchy)
- Multi-modal approaches combine DOM, visual, and textual signals

### LLM-Based Detection
- **DarkPatternLLM**: Uses large language models for detection and explanation
- Emerging area but LLMs themselves are vulnerable to dark patterns

## Open-Source Tools

| Tool | Approach | Platform | License |
|------|----------|----------|---------|
| AidUI | Visual cue + UI content + DP analysis pipeline | Research prototype | Open |
| CogniGuard | Fine-tuned BERT model + Streamlit app | Web app | Open |
| Dapde Highlighter | Browser extension, multi-pattern detection | Chrome/Firefox | Open |
| Dark Pattern Identifier | DOM analysis for bait-and-switch, hidden info | Chrome | Open |
| dark-patterns-recognition | NLP text classification | Chrome | Open |

## LLM Agent Vulnerability

Critical finding: LLM-based GUI agents are MORE susceptible to dark patterns than humans:

- **41% susceptibility** with single dark pattern present
- **~80% susceptibility** with concurrent patterns on multistep tasks
- **Inverse scaling**: Larger models (32B-72B) are MORE vulnerable, not less
- Humans succumb via cognitive shortcuts; agents via procedural blind spots
- Human oversight helps but introduces attentional tunneling and cognitive load
- SusBench benchmark created for evaluating agent susceptibility

## Dataset Gaps

Four public datasets contain 5,561 instances covering only 44% of identified patterns:
- 30 of 68 types represented
- 38 types completely absent
- Inconsistent classification standards across datasets

## Sources

- [Comprehensive Study](https://arxiv.org/html/2412.09147v1) -- Tool coverage analysis
- [YOLOv12x Detection](https://arxiv.org/html/2512.18269v1) -- Real-time visual detection
- [BERT Shopping Detection](https://www.tandfonline.com/doi/full/10.1080/17517575.2025.2457961) -- NLP approach
- [LLM Susceptibility](https://arxiv.org/abs/2509.10723) -- Agent vulnerability study
- [GitHub dark-pattern topic](https://github.com/topics/dark-pattern) -- Open-source tools
