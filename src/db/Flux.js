function getSpreadQuery(timeStart, timeEnd, field) {
  return `
    from(bucket: "plc_mask_counts")
      |> range(start: ${timeStart}, stop: ${timeEnd})
      |> filter(fn: (r) => r["_measurement"] == "plc.vector")
      |> filter(fn: (r) => r["_field"] == "${field}")
      |> group(columns: ["time", "machine"])
      |> keep(columns: ["_time", "_field", "_value", "machine"])
      |> spread()
      |> yield()
  `;
}

module.exports = { getSpreadQuery };
