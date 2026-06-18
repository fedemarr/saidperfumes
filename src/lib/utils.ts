import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `SAID-${year}-${random}`;
}

export function getTransferPrice(price: number): number {
  const discount = Number(process.env.TRANSFER_DISCOUNT_PERCENT ?? 20) / 100;
  return Math.round(price * (1 - discount));
}

export function hasFreeShipping(total: number): boolean {
  const threshold = Number(process.env.FREE_SHIPPING_THRESHOLD ?? 150000);
  return total >= threshold;
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

export const BRANDS = [
  "LATTAFA",
  "ARMAF",
  "AFNAN",
  "RASASI",
  "FRENCH AVENUE",
  "AL HARAMAIN",
  "BHARARA",
  "AL WATANIAH",
  "XERJOFF",
  "VALENTINO",
  "JEAN PAUL GAULTIER",
  "RAYHAAN",
  "MAISON ALHAMBRA",
  "EMPER",
  "GIORGIO",
  "DHERRERA",
];

export const BRANDS_BY_CATEGORY: { label: string; value: string; brands: string[] }[] = [
  {
    label: "Árabe",
    value: "ARABE",
    brands: ["Lattafa", "Armaf", "Afnan", "Rasasi", "French Avenue", "Al Haramain", "Bharara", "Ajmal", "Amouage", "Arabian Oud", "Swiss Arabian", "Zimaya"],
  },
  {
    label: "Diseñador",
    value: "DESIGNER",
    brands: ["Valentino", "Jean Paul Gaultier", "Giorgio"],
  },
  {
    label: "Nicho",
    value: "NICHE",
    brands: ["Xerjoff"],
  },
  {
    label: "Nacional",
    value: "NATIONAL",
    brands: ["Dherrera"],
  },
];

export function getCardPrice(price: number): number {
  return Math.round(price * 1.20);
}

export const OCCASIONS = [
  "Día",
  "Noche",
  "Formal",
  "Casual",
  "Primavera",
  "Verano",
  "Otoño",
  "Invierno",
  "Romántico",
  "Trabajo",
  "Deportivo",
];
