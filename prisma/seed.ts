import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create SuperAdmin
  const superAdminPassword = await bcrypt.hash('admin123', 12)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@figuracollect.com' },
    update: {},
    create: {
      email: 'admin@figuracollect.com',
      username: 'superadmin',
      password: superAdminPassword,
      name: 'Super Admin',
      country: 'México',
      role: 'SUPERADMIN',
      emailVerified: true
    }
  })
  console.log('Created superadmin:', superAdmin.email)

  // Create demo user
  const userPassword = await bcrypt.hash('user123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@figuracollect.com' },
    update: {},
    create: {
      email: 'demo@figuracollect.com',
      username: 'democolector',
      password: userPassword,
      name: 'Demo User',
      country: 'México',
      bio: 'Coleccionista de figuras de anime desde 2015',
      role: 'USER',
      emailVerified: true
    }
  })
  console.log('Created demo user:', demoUser.email)

  // Create Brands
  const goodSmile = await prisma.brand.upsert({
    where: { slug: 'good-smile-company' },
    update: {},
    create: {
      name: 'Good Smile Company',
      slug: 'good-smile-company',
      description: 'Fabricante japonés de figuras de alta calidad'
    }
  })

  const kotobukiya = await prisma.brand.upsert({
    where: { slug: 'kotobukiya' },
    update: {},
    create: {
      name: 'Kotobukiya',
      slug: 'kotobukiya',
      description: 'Empresa japonesa de figuras y kits de modelos'
    }
  })

  const bandai = await prisma.brand.upsert({
    where: { slug: 'bandai' },
    update: {},
    create: {
      name: 'Bandai',
      slug: 'bandai',
      description: 'Uno de los mayores fabricantes de juguetes del mundo'
    }
  })

  const megahouse = await prisma.brand.upsert({
    where: { slug: 'megahouse' },
    update: {},
    create: {
      name: 'MegaHouse',
      slug: 'megahouse',
      description: 'Fabricante de figuras premium y coleccionables'
    }
  })

  console.log('Created brands')

  // Create Lines
  const nendoroid = await prisma.line.upsert({
    where: { slug: 'nendoroid' },
    update: {},
    create: {
      name: 'Nendoroid',
      slug: 'nendoroid',
      brandId: goodSmile.id,
      releaseYear: 2006,
      description: 'Figuras chibi articuladas con partes intercambiables'
    }
  })

  const popUpParade = await prisma.line.upsert({
    where: { slug: 'pop-up-parade' },
    update: {},
    create: {
      name: 'Pop Up Parade',
      slug: 'pop-up-parade',
      brandId: goodSmile.id,
      releaseYear: 2019,
      description: 'Línea de figuras de precio accesible'
    }
  })

  const figma = await prisma.line.upsert({
    where: { slug: 'figma' },
    update: {},
    create: {
      name: 'figma',
      slug: 'figma',
      brandId: goodSmile.id,
      releaseYear: 2008,
      description: 'Figuras de acción altamente articuladas'
    }
  })

  const artfxJ = await prisma.line.upsert({
    where: { slug: 'artfx-j' },
    update: {},
    create: {
      name: 'ARTFX J',
      slug: 'artfx-j',
      brandId: kotobukiya.id,
      releaseYear: 2014,
      description: 'Línea premium de figuras a escala 1/8'
    }
  })

  const figuartsZero = await prisma.line.upsert({
    where: { slug: 'figuarts-zero' },
    update: {},
    create: {
      name: 'Figuarts Zero',
      slug: 'figuarts-zero',
      brandId: bandai.id,
      releaseYear: 2010,
      description: 'Figuras estáticas de alta calidad'
    }
  })

  const portraitOfPirates = await prisma.line.upsert({
    where: { slug: 'portrait-of-pirates' },
    update: {},
    create: {
      name: 'Portrait of Pirates',
      slug: 'portrait-of-pirates',
      brandId: megahouse.id,
      releaseYear: 2004,
      description: 'Línea premium de figuras de One Piece'
    }
  })

  console.log('Created lines')

  // Create Series
  const demonSlayer = await prisma.series.upsert({
    where: { slug: 'demon-slayer' },
    update: {},
    create: {
      name: 'Demon Slayer',
      slug: 'demon-slayer',
      description: 'Kimetsu no Yaiba'
    }
  })

  const onePiece = await prisma.series.upsert({
    where: { slug: 'one-piece' },
    update: {},
    create: {
      name: 'One Piece',
      slug: 'one-piece',
      description: 'La aventura de Luffy y su tripulación'
    }
  })

  const myHeroAcademia = await prisma.series.upsert({
    where: { slug: 'my-hero-academia' },
    update: {},
    create: {
      name: 'My Hero Academia',
      slug: 'my-hero-academia',
      description: 'Boku no Hero Academia'
    }
  })

  const jujutsuKaisen = await prisma.series.upsert({
    where: { slug: 'jujutsu-kaisen' },
    update: {},
    create: {
      name: 'Jujutsu Kaisen',
      slug: 'jujutsu-kaisen',
      description: 'Anime de hechiceros y maldiciones'
    }
  })

  const spyFamily = await prisma.series.upsert({
    where: { slug: 'spy-x-family' },
    update: {},
    create: {
      name: 'SPY x FAMILY',
      slug: 'spy-x-family',
      description: 'La familia Forger'
    }
  })

  console.log('Created series')

  // Create Tags
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { name: 'PVC' }, update: {}, create: { name: 'PVC' } }),
    prisma.tag.upsert({ where: { name: 'ABS' }, update: {}, create: { name: 'ABS' } }),
    prisma.tag.upsert({ where: { name: 'Articulada' }, update: {}, create: { name: 'Articulada' } }),
    prisma.tag.upsert({ where: { name: 'Estática' }, update: {}, create: { name: 'Estática' } }),
    prisma.tag.upsert({ where: { name: 'Prize' }, update: {}, create: { name: 'Prize' } }),
    prisma.tag.upsert({ where: { name: 'Premium' }, update: {}, create: { name: 'Premium' } }),
    prisma.tag.upsert({ where: { name: 'Limited' }, update: {}, create: { name: 'Limited' } }),
    prisma.tag.upsert({ where: { name: 'Re-release' }, update: {}, create: { name: 'Re-release' } })
  ])

  console.log('Created tags')

  // Create Figures
  const figure1 = await prisma.figure.create({
    data: {
      name: 'Nendoroid Tanjiro Kamado',
      description: 'Figura Nendoroid de Tanjiro Kamado de Demon Slayer. Incluye múltiples expresiones faciales y accesorios.',
      sku: 'GSC-ND-1408',
      size: '10cm',
      scale: 'Nendoroid',
      material: 'PVC & ABS',
      maker: 'Good Smile Company',
      priceMXN: 1500,
      priceUSD: 75,
      priceYEN: 6800,
      releaseDate: '2024-06',
      isReleased: true,
      isNSFW: false,
      brandId: goodSmile.id,
      lineId: nendoroid.id,
      tags: {
        create: [
          { tagId: tags[0].id },
          { tagId: tags[1].id },
          { tagId: tags[2].id }
        ]
      },
      series: {
        create: [{ seriesId: demonSlayer.id }]
      }
    }
  })

  const figure2 = await prisma.figure.create({
    data: {
      name: 'Pop Up Parade Nezuko Kamado',
      description: 'Figura Pop Up Parade de Nezuko en su forma compacta.',
      sku: 'GSC-PUP-NEZ',
      size: '17cm',
      scale: '1/8',
      material: 'PVC',
      maker: 'Good Smile Company',
      priceMXN: 800,
      priceUSD: 40,
      priceYEN: 4500,
      releaseDate: '2024-03',
      isReleased: true,
      isNSFW: false,
      brandId: goodSmile.id,
      lineId: popUpParade.id,
      tags: {
        create: [
          { tagId: tags[0].id },
          { tagId: tags[3].id }
        ]
      },
      series: {
        create: [{ seriesId: demonSlayer.id }]
      }
    }
  })

  const figure3 = await prisma.figure.create({
    data: {
      name: 'ARTFX J Izuku Midoriya',
      description: 'Figura a escala 1/8 de Deku en pose de acción con su quirk activado.',
      sku: 'KOTO-ARTFX-DEKU',
      size: '21cm',
      scale: '1/8',
      material: 'PVC',
      maker: 'Kotobukiya',
      priceMXN: 2800,
      priceUSD: 140,
      priceYEN: 15800,
      releaseDate: '2024-08',
      isReleased: true,
      isNSFW: false,
      brandId: kotobukiya.id,
      lineId: artfxJ.id,
      tags: {
        create: [
          { tagId: tags[0].id },
          { tagId: tags[3].id },
          { tagId: tags[5].id }
        ]
      },
      series: {
        create: [{ seriesId: myHeroAcademia.id }]
      }
    }
  })

  const figure4 = await prisma.figure.create({
    data: {
      name: 'figma Gojo Satoru',
      description: 'Figura articulada figma de Gojo Satoru con múltiples accesorios incluyendo su venda.',
      sku: 'GSC-FIG-GOJO',
      size: '16cm',
      scale: 'figma',
      material: 'PVC & ABS',
      maker: 'Good Smile Company',
      priceMXN: 2200,
      priceUSD: 110,
      priceYEN: 12000,
      releaseDate: '2025-02',
      isReleased: false,
      isNSFW: false,
      brandId: goodSmile.id,
      lineId: figma.id,
      tags: {
        create: [
          { tagId: tags[0].id },
          { tagId: tags[1].id },
          { tagId: tags[2].id }
        ]
      },
      series: {
        create: [{ seriesId: jujutsuKaisen.id }]
      }
    }
  })

  const figure5 = await prisma.figure.create({
    data: {
      name: 'Portrait of Pirates Monkey D. Luffy Gear 5',
      description: 'Figura premium de Luffy en su transformación Gear 5 con efectos de despertar.',
      sku: 'MH-POP-LUFFY-G5',
      size: '25cm',
      scale: '1/8',
      material: 'PVC',
      maker: 'MegaHouse',
      priceMXN: 4500,
      priceUSD: 225,
      priceYEN: 25000,
      releaseDate: '2025-04',
      isReleased: false,
      isNSFW: false,
      brandId: megahouse.id,
      lineId: portraitOfPirates.id,
      tags: {
        create: [
          { tagId: tags[0].id },
          { tagId: tags[3].id },
          { tagId: tags[5].id },
          { tagId: tags[6].id }
        ]
      },
      series: {
        create: [{ seriesId: onePiece.id }]
      }
    }
  })

  const figure6 = await prisma.figure.create({
    data: {
      name: 'Nendoroid Anya Forger',
      description: 'Nendoroid de Anya con sus expresiones icónicas incluyendo la cara de "heh".',
      sku: 'GSC-ND-ANYA',
      size: '10cm',
      scale: 'Nendoroid',
      material: 'PVC & ABS',
      maker: 'Good Smile Company',
      priceMXN: 1400,
      priceUSD: 70,
      priceYEN: 6500,
      releaseDate: '2024-01',
      isReleased: true,
      isNSFW: false,
      brandId: goodSmile.id,
      lineId: nendoroid.id,
      tags: {
        create: [
          { tagId: tags[0].id },
          { tagId: tags[1].id },
          { tagId: tags[2].id }
        ]
      },
      series: {
        create: [{ seriesId: spyFamily.id }]
      }
    }
  })

  const figure7 = await prisma.figure.create({
    data: {
      name: 'Figuarts Zero Roronoa Zoro - Wano Country',
      description: 'Figura de Zoro con su traje de Wano y efectos de corte.',
      sku: 'BAN-FZ-ZORO-WANO',
      size: '19cm',
      scale: '1/8',
      material: 'PVC',
      maker: 'Bandai',
      priceMXN: 1800,
      priceUSD: 90,
      priceYEN: 9800,
      releaseDate: '2025-06',
      isReleased: false,
      isNSFW: false,
      brandId: bandai.id,
      lineId: figuartsZero.id,
      tags: {
        create: [
          { tagId: tags[0].id },
          { tagId: tags[3].id }
        ]
      },
      series: {
        create: [{ seriesId: onePiece.id }]
      }
    }
  })

  console.log('Created figures')

  // Add figures to demo user's inventory
  await prisma.userFigure.createMany({
    data: [
      { userId: demoUser.id, figureId: figure1.id, status: 'OWNED', userPrice: 1450 },
      { userId: demoUser.id, figureId: figure2.id, status: 'OWNED', userPrice: 780 },
      { userId: demoUser.id, figureId: figure6.id, status: 'OWNED', userPrice: 1380 },
      { userId: demoUser.id, figureId: figure4.id, status: 'PREORDER', preorderMonth: '2025-02', userPrice: 2200 },
      { userId: demoUser.id, figureId: figure5.id, status: 'PREORDER', preorderMonth: '2025-04', userPrice: 4500 },
      { userId: demoUser.id, figureId: figure3.id, status: 'WISHLIST' }
    ]
  })

  console.log('Created user inventory')

  // Create a list
  const list = await prisma.list.create({
    data: {
      name: 'Mejores figuras de Demon Slayer',
      description: 'Mi selección personal de las mejores figuras de Kimetsu no Yaiba',
      isOfficial: true,
      isFeatured: true,
      createdById: superAdmin.id,
      items: {
        create: [
          { figureId: figure1.id, order: 1 },
          { figureId: figure2.id, order: 2 }
        ]
      }
    }
  })

  console.log('Created featured list')

  // Create a review
  await prisma.review.create({
    data: {
      userId: demoUser.id,
      figureId: figure1.id,
      rating: 4.5,
      title: 'Excelente Nendoroid',
      description: 'La calidad es increíble, los accesorios son variados y las expresiones faciales capturan perfectamente al personaje. Muy recomendada para fans de Demon Slayer.'
    }
  })

  console.log('Created review')

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
