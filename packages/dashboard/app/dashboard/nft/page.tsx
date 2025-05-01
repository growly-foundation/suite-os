'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useFloorPrices } from '@/hooks/useOpenSea';
import { OpenSeaColor, OpenSeaGray } from '@/components/svg/opensea';

const nfts = [
  // {
  //   identifier:
  //     "94717753173629969143230179333213320391735940674998678296986128471096988554414",
  //   collection: "ens",
  //   contract: "0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401",
  //   token_standard: "erc1155",
  //   name: null,
  //   description:
  //     "This is an unknown ENS name with the hash: 0xd1685936825bc9eb3775664e73a4cb19a6a85bc3d4a7a6506b2a4b31aa1054ae",
  //   image_url: null,
  //   display_image_url: "",
  //   display_animation_url: null,
  //   metadata_url:
  //     "https://metadata.ens.domains/mainnet/0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401/94717753173629969143230179333213320391735940674998678296986128471096988554414",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401/94717753173629969143230179333213320391735940674998678296986128471096988554414",
  //   updated_at: "2024-07-09T00:27:14.990408",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
  // {
  //   identifier: "2233",
  //   collection: "sofamon-seed",
  //   contract: "0xd7b26749ccf89edd87ddd427d69406b66d83d913",
  //   token_standard: "erc721",
  //   name: "Sofamon #2234",
  //   description: "Adorable and charming sidekicks on the Sofa.",
  //   image_url:
  //     "https://ipfs.io/ipfs/bafybeiawyypwspxguybs7k6o6eycr5werpmezbqllqpu4evovluijopmx4/2234.png",
  //   display_image_url:
  //     "https://i.seadn.io/s/raw/files/6b2f20c31f2a48979fc7c0ea93ae6e49.png?w=500&auto=format",
  //   display_animation_url: null,
  //   metadata_url:
  //     "https://ipfs.io/ipfs/bafybeiarzw2dx6665pjwee622wmalzlwraw7b35objttz5snognpn567ia/2233",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0xd7b26749ccf89edd87ddd427d69406b66d83d913/2233",
  //   updated_at: "2024-01-18T18:14:14.073992",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
  // {
  //   identifier: "586",
  //   collection: "sofa-vision",
  //   contract: "0xdf1d852febf9d780343eb7d4ce732db678b78581",
  //   token_standard: "erc721",
  //   name: "Sofa #586",
  //   description:
  //     "**Welcome to SOFA**  \n\nYou're already a verified Sofam, and there's always a place reserved for you here.\nLying alone comfortable, or sitting with your Sofam.",
  //   image_url: "https://meta.sofanft.io/images/586.png",
  //   display_image_url:
  //     "https://i.seadn.io/s/raw/files/a2cda3017887450ac30f3bda298251d1.png?w=500&auto=format",
  //   display_animation_url: null,
  //   metadata_url: "https://meta.sofanft.io/api/v1/metadata/sofa/586",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0xdf1d852febf9d780343eb7d4ce732db678b78581/586",
  //   updated_at: "2024-03-22T03:03:25.906579",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
  // {
  //   identifier: "5334",
  //   collection: "sofa-vision",
  //   contract: "0xdf1d852febf9d780343eb7d4ce732db678b78581",
  //   token_standard: "erc721",
  //   name: "Sofa #5334",
  //   description:
  //     "**Welcome to SOFA**  \n\nYou're already a verified Sofam, and there's always a place reserved for you here.\nLying alone comfortable, or sitting with your Sofam.",
  //   image_url: "https://meta.sofanft.io/images/5334.png",
  //   display_image_url:
  //     "https://i.seadn.io/s/raw/files/e23ec2b330c5e7fb18c26ef35894eb85.png?w=500&auto=format",
  //   display_animation_url: null,
  //   metadata_url: "https://meta.sofanft.io/api/v1/metadata/sofa/5334",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0xdf1d852febf9d780343eb7d4ce732db678b78581/5334",
  //   updated_at: "2024-03-08T18:08:29.055949",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
  // {
  //   identifier: "9711",
  //   collection: "nakamigos",
  //   contract: "0xd774557b647330c91bf44cfeab205095f7e6c367",
  //   token_standard: "erc721",
  //   name: "Nakamigos #9711",
  //   description: null,
  //   image_url:
  //     "https://ipfs.io/ipfs/QmS2gSfepEvCQQvtszhSb21sncn65b6iYDXPzM75NXjq4L",
  //   display_image_url:
  //     "https://i.seadn.io/s/raw/files/2be38eb5daa73b8b0ce7fb9fddcdc0ff.png?w=500&auto=format",
  //   display_animation_url: null,
  //   metadata_url:
  //     "https://ipfs.io/ipfs/QmaN1jRPtmzeqhp6s3mR1SRK4q1xWPvFvwqW1jyN6trir9/9711",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0xd774557b647330c91bf44cfeab205095f7e6c367/9711",
  //   updated_at: "2024-03-21T14:16:38.407221",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
  {
    identifier: '4534',
    collection: 'lilpudgys',
    contract: '0x524cab2ec69124574082676e6f654a18df49a048',
    token_standard: 'erc721',
    name: 'Lil Pudgy #4534',
    description:
      'Lil Pudgys are a collection of 22,222 randomly generated NFTs minted on Ethereum.',
    image_url: 'https://api.pudgypenguins.io/lil/image/4534',
    display_image_url:
      'https://i.seadn.io/gcs/files/13f831bdd975ffaeb931ca79fad503a7.png?w=500&auto=format',
    display_animation_url: null,
    metadata_url: 'https://api.pudgypenguins.io/lil/4534',
    opensea_url:
      'https://opensea.io/assets/ethereum/0x524cab2ec69124574082676e6f654a18df49a048/4534',
    updated_at: '2025-01-22T10:36:15.352446',
    is_disabled: false,
    is_nsfw: false,
  },
  // {
  //   identifier: "8653",
  //   collection: "sipherianflash",
  //   contract: "0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982",
  //   token_standard: "erc721",
  //   name: "Sipher NEKO #6542",
  //   description: "",
  //   image_url:
  //     "https://contents.playsipher.com/loyalty/erc721/character/default/sipher-genesis-default.png",
  //   display_image_url:
  //     "https://i.seadn.io/s/raw/files/aa893a829da5e66c84f1c021ef2684ad.png?w=500&auto=format",
  //   display_animation_url:
  //     "https://raw.seadn.io/files/12cd01c92351b2aba434ae9bf8178780.mp4",
  //   metadata_url:
  //     "https://metadata-api.playsipher.com/api/uri/0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982:1/8653",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982/8653",
  //   updated_at: "2024-12-31T08:41:22.562964",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
  // {
  //   identifier: "7380",
  //   collection: "sipherianflash",
  //   contract: "0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982",
  //   token_standard: "erc721",
  //   name: "Sipher NEKO #5269",
  //   description: "",
  //   image_url:
  //     "https://contents.playsipher.com/loyalty/erc721/character/default/sipher-genesis-default.png",
  //   display_image_url:
  //     "https://i.seadn.io/s/raw/files/aa893a829da5e66c84f1c021ef2684ad.png?w=500&auto=format",
  //   display_animation_url:
  //     "https://raw.seadn.io/files/12cd01c92351b2aba434ae9bf8178780.mp4",
  //   metadata_url:
  //     "https://metadata-api.playsipher.com/api/uri/0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982:1/7380",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982/7380",
  //   updated_at: "2024-12-31T08:41:17.437358",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
  // {
  //   identifier: "4733",
  //   collection: "sipherianflash",
  //   contract: "0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982",
  //   token_standard: "erc721",
  //   name: "Sipher NEKO #2622",
  //   description: "",
  //   image_url:
  //     "https://contents.playsipher.com/loyalty/erc721/character/default/sipher-genesis-default.png",
  //   display_image_url:
  //     "https://i.seadn.io/s/raw/files/aa893a829da5e66c84f1c021ef2684ad.png?w=500&auto=format",
  //   display_animation_url:
  //     "https://raw.seadn.io/files/12cd01c92351b2aba434ae9bf8178780.mp4",
  //   metadata_url:
  //     "https://metadata-api.playsipher.com/api/uri/0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982:1/4733",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982/4733",
  //   updated_at: "2024-12-31T08:41:05.077981",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
  // {
  //   identifier: "3060",
  //   collection: "sipherianflash",
  //   contract: "0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982",
  //   token_standard: "erc721",
  //   name: "Sipher NEKO #949",
  //   description: "",
  //   image_url:
  //     "https://contents.playsipher.com/loyalty/erc721/character/default/sipher-genesis-default.png",
  //   display_image_url:
  //     "https://i.seadn.io/s/raw/files/aa893a829da5e66c84f1c021ef2684ad.png?w=500&auto=format",
  //   display_animation_url:
  //     "https://raw.seadn.io/files/12cd01c92351b2aba434ae9bf8178780.mp4",
  //   metadata_url:
  //     "https://metadata-api.playsipher.com/api/uri/0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982:1/3060",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982/3060",
  //   updated_at: "2024-12-31T08:40:55.270759",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
  // {
  //   identifier: "419",
  //   collection: "sipherianflash",
  //   contract: "0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982",
  //   token_standard: "erc721",
  //   name: "Sipher NEKO #8308",
  //   description: "",
  //   image_url:
  //     "https://contents.playsipher.com/loyalty/erc721/character/default/sipher-genesis-default.png",
  //   display_image_url:
  //     "https://i.seadn.io/s/raw/files/aa893a829da5e66c84f1c021ef2684ad.png?w=500&auto=format",
  //   display_animation_url:
  //     "https://raw.seadn.io/files/12cd01c92351b2aba434ae9bf8178780.mp4",
  //   metadata_url:
  //     "https://metadata-api.playsipher.com/api/uri/0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982:1/419",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0x09e0df4ae51111ca27d6b85708cfb3f1f7cae982/419",
  //   updated_at: "2024-12-31T08:40:34.454298",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
  // {
  //   identifier: "9297",
  //   collection: "sipheriansurge",
  //   contract: "0x9c57d0278199c931cf149cc769f37bb7847091e7",
  //   token_standard: "erc721",
  //   name: "Sipher INU #7408",
  //   description: "",
  //   image_url:
  //     "https://contents.playsipher.com/loyalty/erc721/character/default/sipher-genesis-default.png",
  //   display_image_url:
  //     "https://i.seadn.io/s/raw/files/aa893a829da5e66c84f1c021ef2684ad.png?w=500&auto=format",
  //   display_animation_url:
  //     "https://raw.seadn.io/files/12cd01c92351b2aba434ae9bf8178780.mp4",
  //   metadata_url:
  //     "https://metadata-api.playsipher.com/api/uri/0x9c57d0278199c931cf149cc769f37bb7847091e7:1/9297",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0x9c57d0278199c931cf149cc769f37bb7847091e7/9297",
  //   updated_at: "2024-12-31T07:42:17.837892",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
  // {
  //   identifier: "7044",
  //   collection: "sipheriansurge",
  //   contract: "0x9c57d0278199c931cf149cc769f37bb7847091e7",
  //   token_standard: "erc721",
  //   name: "Sipher INU #5155",
  //   description: "",
  //   image_url:
  //     "https://contents.playsipher.com/loyalty/erc721/character/default/sipher-genesis-default.png",
  //   display_image_url:
  //     "https://i.seadn.io/s/raw/files/aa893a829da5e66c84f1c021ef2684ad.png?w=500&auto=format",
  //   display_animation_url:
  //     "https://raw.seadn.io/files/12cd01c92351b2aba434ae9bf8178780.mp4",
  //   metadata_url:
  //     "https://metadata-api.playsipher.com/api/uri/0x9c57d0278199c931cf149cc769f37bb7847091e7:1/7044",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0x9c57d0278199c931cf149cc769f37bb7847091e7/7044",
  //   updated_at: "2024-12-31T07:49:57.678651",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
  // {
  //   identifier: "4277",
  //   collection: "sipheriansurge",
  //   contract: "0x9c57d0278199c931cf149cc769f37bb7847091e7",
  //   token_standard: "erc721",
  //   name: "Sipher INU #2388",
  //   description: "",
  //   image_url:
  //     "https://contents.playsipher.com/loyalty/erc721/character/default/sipher-genesis-default.png",
  //   display_image_url:
  //     "https://i.seadn.io/s/raw/files/aa893a829da5e66c84f1c021ef2684ad.png?w=500&auto=format",
  //   display_animation_url:
  //     "https://raw.seadn.io/files/12cd01c92351b2aba434ae9bf8178780.mp4",
  //   metadata_url:
  //     "https://metadata-api.playsipher.com/api/uri/0x9c57d0278199c931cf149cc769f37bb7847091e7:1/4277",
  //   opensea_url:
  //     "https://opensea.io/assets/ethereum/0x9c57d0278199c931cf149cc769f37bb7847091e7/4277",
  //   updated_at: "2024-12-31T08:23:01.069329",
  //   is_disabled: false,
  //   is_nsfw: false,
  // },
];

export default function NFT() {
  const uniqueSlugs = [...new Set(nfts.map(nft => nft.collection))];
  const floorPrices = useFloorPrices(uniqueSlugs);

  return (
    <div className="px-4 lg:px-6 py-6">
      <h2 className="text-2xl font-semibold mb-4">NFT Collection</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {nfts.map(nft => (
          <Card key={nft.identifier} className="overflow-hidden">
            <CardHeader className="p-2">
              <CardTitle className="text-base font-medium truncate">
                {nft.name || 'Unnamed NFT'}
              </CardTitle>
              <p className="text-sm text-muted-foreground truncate">{nft.collection}</p>
            </CardHeader>

            <CardContent className="p-0">
              <Image
                src={nft.display_image_url || nft.image_url || '/placeholder.svg'}
                alt={nft.name || 'NFT image'}
                width={500}
                height={500}
                className="w-full h-auto object-contain bg-muted aspect-square"
                unoptimized
              />
              <div className="p-4 flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Floor:{' '}
                  {floorPrices[nft.collection] != null
                    ? `${floorPrices[nft.collection]} ETH`
                    : 'Loading...'}
                </p>
                <Button variant="link" asChild className="text-xs p-0 h-auto group">
                  <a
                    href={nft.opensea_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center">
                    <span className="block group-hover:hidden">
                      <OpenSeaGray />
                    </span>
                    <span className="hidden group-hover:block">
                      <OpenSeaColor />
                    </span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
