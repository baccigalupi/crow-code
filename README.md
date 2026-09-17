# crow-code

Task oriented coding agent.

## Coding agents until it is automated

```
coding   in/out ($/M)     total    model
71.5    $0.07/$0.25     $0.33     z-ai/glm-5.3-flash
69.1    $0.05/$0.12     $0.17     deepseek/deepseek-v4-flash
60.2    $0.30/$0.61     $0.91     xiaomi/mimo-v2.5-pro
58.8    $0.07/$0.29     $0.36     tencent/hy3
56.8    $0.12/$0.24     $0.36     xiaomi/mimo-v2.5
```

## Free coding agents

```
upstage/solar-pro4:free        sibling AA coding 52.7
meituan/longcat-2.0:free       sibling AA coding 45.3
stepfun/step-3.7-flash:free    sibling AA coding 39.6
```

## Setup

```bash
npm install
npm test
```

## TDD

This repo follows strict test-driven development: write the failing test first,
watch it fail, write minimal code to pass, then refactor.

```bash
# New feature workflow
1. Write the failing test in tests/
2. npm test   # watch it fail (RED)
3. Implement in src/
4. npm test   # watch it pass (GREEN)
5. Refactor, keep tests green
```
