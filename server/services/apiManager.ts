import prisma from './prisma';

// گرفتن APIهای فعال (برای fallback)
export async function getActiveApis(type: string) {
  return await prisma.apiSource.findMany({
    where: {
      type,
      isActive: true,
    },
    orderBy: {
      priority: 'asc',
    },
  });
}

// گرفتن تنظیمات هر دارایی
export async function getAssetConfig(asset: string) {
  return await prisma.assetConfig.findFirst({
    where: {
      asset,
      isActive: true,
    },
    include: {
      api: true,
    },
  });
}