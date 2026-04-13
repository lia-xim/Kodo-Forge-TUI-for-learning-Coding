import Image from 'next/image';
import { brandAssets } from '@/lib/brand';

interface BrandLogoProps {
  variant?: 'full' | 'mark';
  alt?: string;
  className?: string;
  priority?: boolean;
}

export default function BrandLogo({
  variant = 'full',
  alt = 'Kodo Forge',
  className,
  priority = false,
}: BrandLogoProps) {
  const asset = variant === 'mark' ? brandAssets.mark : brandAssets.full;

  return (
    <Image
      src={asset.webpSrc}
      alt={alt}
      width={asset.width}
      height={asset.height}
      className={className}
      priority={priority}
    />
  );
}
