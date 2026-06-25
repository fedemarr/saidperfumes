import Image from "next/image";
import Link from "next/link";

const LOGOS = [
  { name: "Lattafa",       file: "LATTAFA .JPG",            brand: "Lattafa" },
  { name: "Armaf",         file: "ARMAF .JPG",              brand: "Armaf" },
  { name: "Afnan",         file: "AFNAN .JPG",              brand: "Afnan" },
  { name: "Rasasi",        file: "RASASI .JPG",             brand: "Rasasi" },
  { name: "French Avenue", file: "FRENCH AVENUE .JPG",      brand: "French Avenue" },
  { name: "Al Haramain",   file: "AL HARAMAIN .JPG",        brand: "Al Haramain" },
  { name: "Bharara",       file: "BHARARA .JPG",            brand: "Bharara" },
  { name: "Azzaro",        file: "AZZARO .jpg",             brand: "Azzaro" },
  { name: "Valentino",     file: "VALENTINO .JPG",          brand: "Valentino" },
  { name: "Xerjoff",       file: "XERJOFF .JPG",            brand: "Xerjoff" },
  { name: "Rayhaan",       file: "RAYHAAN .JPG",            brand: "Rayhaan" },
  { name: "Al Wataniah",   file: "AL WATANIAH .JPG",        brand: "Al Wataniah" },
];

export function BrandLogos() {
  return (
    <section className="py-14 border-t border-border">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="section-heading mb-10">Nuestras Marcas</h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {LOGOS.map(({ name, file, brand }) => (
            <Link
              key={name}
              href={`/productos?brand=${encodeURIComponent(brand)}`}
              className="group flex items-center justify-center bg-black rounded-sm p-3 aspect-video hover:ring-2 hover:ring-gold transition-all duration-300"
            >
              <div className="relative w-full h-full">
                <Image
                  src={`/PERFUMES SAID/LOGOS/${file}`}
                  alt={name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 17vw"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
