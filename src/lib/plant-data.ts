import placeholderData from './placeholder-images.json';
import type { Plant } from './types';

const { placeholderImages: PlaceHolderImages } = placeholderData;

const plantInfo: Omit<Plant, 'image' | 'id'>[] = [
  {
    name: 'Ashwagandha',
    scientificName: 'Withania somnifera',
    description: 'Ashwagandha is a small evergreen shrub. It has yellow flowers and red fruit, about the size of a raisin. The herb is native to the dry regions of India, northern Africa, and the Middle East, but it can be grown in milder climates as well.',
    uses: 'Known as an adaptogen, it helps the body manage stress. It is also used to boost brain function, lower blood sugar and cortisol levels, and help fight symptoms of anxiety and depression.'
  },
  {
    name: 'Tulsi (Holy Basil)',
    scientificName: 'Ocimum tenuiflorum',
    description: 'Tulsi is an aromatic perennial plant in the family Lamiaceae. It is native to the Indian subcontinent and widespread as a cultivated plant throughout the Southeast Asian tropics.',
    uses: 'Tulsi is revered for its divine properties. It is used to support immunity, respiratory health, and promote a sense of calm and well-being. It is also a powerful antioxidant.'
  },
  {
    name: 'Turmeric',
    scientificName: 'Curcuma longa',
    description: 'Turmeric is a flowering plant, Curcuma longa of the ginger family, Zingiberaceae, the roots of which are used in cooking. The plant is a perennial, rhizomatous, herbaceous plant native to the Indian subcontinent and Southeast Asia.',
    uses: 'The main active ingredient is curcumin, which has powerful anti-inflammatory effects and is a very strong antioxidant. It is used in Ayurvedic medicine to treat inflammation, skin diseases, and digestive issues.'
  },
  {
    name: 'Brahmi',
    scientificName: 'Bacopa monnieri',
    description: 'Brahmi is a perennial, creeping herb whose habitat includes wetlands and muddy shores. The leaves of this plant are succulent and relatively thick. Its flowers are small and white, with four or five petals.',
    uses: 'Traditionally used to enhance memory, learning, and concentration. Brahmi is a potent nerve tonic and is often used to treat cognitive issues and anxiety.'
  },
  {
    name: 'Neem',
    scientificName: 'Azadirachta indica',
    description: 'Neem is a fast-growing tree of the mahogany family. It is valued for its medicinal properties. Neem is native to the Indian subcontinent and to parts of Southeast Asia and Africa.',
    uses: 'Known for its antibacterial, antiviral, and antifungal properties. Neem is used in a wide range of applications, from dental care and skin treatment to pest control. It is a powerful blood purifier and detoxifier.'
  },
  {
    name: 'Amla (Indian Gooseberry)',
    scientificName: 'Phyllanthus emblica',
    description: 'Amla is a deciduous tree of the family Phyllanthaceae. It is known for its edible fruit of the same name. The fruit is sour, bitter, and astringent, and it is quite fibrous.',
    uses: 'Extremely rich in Vitamin C, it is a powerful antioxidant. Used to boost immunity, improve hair and skin health, and support healthy digestion. It is a cornerstone of Chyawanprash.'
  },
  {
    name: 'Gotu Kola',
    scientificName: 'Centella asiatica',
    description: 'Gotu kola is a herbaceous, perennial plant in the flowering plant family Apiaceae. It is native to wetlands in Asia. It has small, fan-shaped green leaves.',
    uses: 'Known as a brain tonic, it is used to improve memory and cognitive function. It also supports healthy circulation, promotes wound healing, and has calming properties.'
  },
  {
    name: 'Licorice',
    scientificName: 'Glycyrrhiza glabra',
    description: 'Licorice is a herbaceous perennial legume native to Western Asia, North Africa, and Southern Europe. The flavor of licorice comes from a sweet-tasting compound called glycyrrhizin.',
    uses: 'Used as a soothing remedy for sore throats and coughs. It supports respiratory health, helps with digestive issues like acid reflux, and acts as a mild adrenal tonic.'
  },
  {
    name: 'Guggul',
    scientificName: 'Commiphora wightii',
    description: 'Guggul is a flowering plant in the family Burseraceae. It produces a fragrant resin called guggul, which is used in Vedic medicine.',
    uses: 'Traditionally used to support healthy cholesterol levels and manage weight. It has powerful anti-inflammatory and detoxifying properties, often used for joint health.'
  },
  {
    name: 'Cardamom',
    scientificName: 'Elettaria cardamomum',
    description: 'Cardamom is a spice made from the seeds of several plants in the genera Elettaria and Amomum in the family Zingiberaceae. The seeds are small and black, while the pods differ in color and size by species.',
    uses: 'A common flavoring agent, it is also used to treat digestive problems, including indigestion and gas. It has diuretic properties and may help freshen breath.'
  },
  {
    name: 'Ginger',
    scientificName: 'Zingiber officinale',
    description: 'Ginger is a flowering plant whose rhizome, ginger root or ginger, is widely used as a spice and a folk medicine. It is a herbaceous perennial which grows annual pseudostems about one meter tall bearing narrow leaf blades.',
    uses: 'Widely used for various types of "stomach problems," including motion sickness, morning sickness, colic, upset stomach, gas, diarrhea, and nausea. It is a powerful anti-inflammatory and antioxidant.'
  },
  {
    name: 'Moringa',
    scientificName: 'Moringa oleifera',
    description: 'Moringa is a fast-growing, drought-resistant tree, native to the Indian subcontinent. It has been used for centuries due to its medicinal properties and health benefits. It has tiny, rounded leaves.',
    uses: 'Often called the "miracle tree," it is rich in antioxidants, protein, vitamins, and minerals. It is used to reduce inflammation, lower cholesterol, and protect against arsenic toxicity.'
  },
  {
    name: 'Shatavari',
    scientificName: 'Asparagus racemosus',
    description: "Shatavari is a species of asparagus common throughout Nepal, Sri Lanka, India and the Himalayas. It is a climbing plant which grows in low jungle areas. The name 'Shatavari' means 'curer of a hundred diseases'.",
    uses: 'Primarily used as a female reproductive tonic. It supports lactation in new mothers, helps balance hormones, and is also an adaptogen that aids in managing stress.'
  },
  {
    name: 'Giloy',
    scientificName: 'Tinospora cordifolia',
    description: 'Giloy is a large, deciduous, extensively spreading, climbing shrub with several elongated twining branches. It is native to the tropical areas of India, Myanmar, and Sri Lanka. Its leaves are heart-shaped.',
    uses: 'Known as "Amrita" or the "root of immortality." It is a powerful immune-booster, helps in treating chronic fevers, manages diabetes, and reduces stress and anxiety. It also has potent anti-inflammatory benefits.'
  },
  {
    name: 'Fenugreek',
    scientificName: 'Trigonella foenum-graecum',
    description: 'Fenugreek is an annual plant in the family Fabaceae, with leaves consisting of three small obovate to oblong leaflets. It is cultivated worldwide as a semiarid crop. Its seeds and leaves are common ingredients in dishes from the Indian subcontinent.',
    uses: 'Commonly used to improve digestion and increase milk production in breastfeeding mothers. It may also help regulate blood sugar levels, lower cholesterol, and reduce heartburn.'
  }
];

export const PLANT_DATA: Plant[] = plantInfo.map(plant => {
  const id = plant.name.toLowerCase().replace(/ \(.+\)/, '').replace(/ /g, '-');
  const placeholder = PlaceHolderImages.find(p => p.id === id);
  return {
    ...plant,
    id,
    image: {
      url: placeholder?.imageUrl || `https://picsum.photos/seed/${id}/600/400`,
      alt: placeholder?.description || plant.name,
      hint: placeholder?.imageHint || 'plant'
    }
  };
});
