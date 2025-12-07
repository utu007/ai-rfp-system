import { prisma } from "./prisma";

export async function scoreProposalsForRfp(rfpId: number) {
  const responses = await prisma.vendorResponse.findMany({
    where: { rfpId },
    include: { vendor: true },
  });

  if (responses.length === 0) {
    throw new Error("No vendor responses found to score.");
  }

  // Extract values for normalization
  const prices = responses.map((r) => r.price || Infinity);
  const deliveries = responses.map((r) => r.deliveryDays || Infinity);

  const minPrice = Math.min(...prices);
  const minDelivery = Math.min(...deliveries);

  // Convert warranty text to years
  const warrantyYears = (w: string | null) => {
    if (!w) return 0;
    const match = w.match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  };

  const maxWarranty = Math.max(
    ...responses.map((r) => warrantyYears(r.warranty || ""))
  );

  const results = [];

  for (const r of responses) {
    // PRICE SCORE (lower is better)
    let priceScore = 0;
    if (r.price) {
      priceScore = (minPrice / r.price) * 100;
      if (priceScore > 100) priceScore = 100;
    }

    // DELIVERY SCORE (faster is better)
    let deliveryScore = 0;
    if (r.deliveryDays) {
      deliveryScore = (minDelivery / r.deliveryDays) * 100;
      if (deliveryScore > 100) deliveryScore = 100;
    }

    // WARRANTY SCORE (longer is better)
    const w = warrantyYears(r.warranty);
    let warrantyScore = 0;
    if (maxWarranty > 0) {
      warrantyScore = (w / maxWarranty) * 100;
    }

    // Weighted final score
    const total =
      priceScore * 0.5 + // 50%
      deliveryScore * 0.3 + // 30%
      warrantyScore * 0.2; // 20%

    results.push({
      vendor: r.vendor.name,
      vendorEmail: r.vendor.email,
      price: r.price,
      deliveryDays: r.deliveryDays,
      warranty: r.warranty,
      priceScore: Number(priceScore.toFixed(2)),
      deliveryScore: Number(deliveryScore.toFixed(2)),
      warrantyScore: Number(warrantyScore.toFixed(2)),
      totalScore: Number(total.toFixed(2)),
    });
  }

  // Sort highest score first
  results.sort((a, b) => b.totalScore - a.totalScore);

  return results;
}
