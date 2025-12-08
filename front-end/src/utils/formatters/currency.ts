export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined || isNaN(Number(price))) {
    return "0đ";
  }
  return new Intl.NumberFormat("vi-VN").format(Math.round(Number(price))) + "đ";
};

export const formatCurrency = (
  price: number | null | undefined,
  currency: string = "VND",
  locale: string = "vi-VN"
): string => {
  if (price === null || price === undefined || isNaN(Number(price))) {
    return "0đ";
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(Number(price));
  } catch {
    return formatPrice(Number(price));
  }
};
