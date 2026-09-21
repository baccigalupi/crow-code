import type { AABenchmarks, ModelInfo } from '../../types.ts'

class UpdateRecord {
  private record: ModelInfo
  private benchmark: AABenchmarks | undefined

  constructor(record: ModelInfo, benchmark: AABenchmarks | undefined) {
    this.record = record
    this.benchmark = benchmark
  }

  update() {
    if (this.benchmark !== undefined) {
      return this.updateValues(this.benchmark)
    } else {
      return this.setToNull()
    }
  }

  private updateValues(benchmark: AABenchmarks) {
    return {
      ...this.record,
      intelligence: benchmark.intelligence || null,
      coding: benchmark.coding || null,
      agentic: benchmark.agentic || null,
      reasoning: this.reasoning(benchmark),
    }
  }

  private setToNull() {
    return {
      ...this.record,
      intelligence: null,
      coding: null,
      agentic: null,
    }
  }

  private reasoning(benchmark: AABenchmarks) {
    if (this.record.reasoning === null) {
      return benchmark.reasoning
    } else {
      return this.record.reasoning
    }
  }
}

export const applyScores = (
  records: ModelInfo[],
  benchmarks: Record<string, AABenchmarks>,
) => {
  return records.map((record) =>
    new UpdateRecord(record, benchmarks[record.id]).update()
  )
}
