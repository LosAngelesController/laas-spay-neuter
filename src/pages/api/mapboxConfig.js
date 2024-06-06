module.exports = function handler(req, res) {
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
  const mapboxStyle = process.env.MAPBOX_STYLE;

  if (!mapboxToken || !mapboxStyle) {
    return res
      .status(500)
      .json({ error: "Mapbox token or style URL is missing" });
  }

  res.status(200).json({ mapboxToken, mapboxStyle });
};
