export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
};

const en = {
  // Hero
  'hero.tagline': 'African Timeless Luxury',
  'hero.shopNow': 'Shop Now',

  // Navigation
  'nav.contactUs': 'Contact Us',
  'nav.invest': 'Invest',
  'nav.myAccount': 'My Account',
  'nav.signOut': 'Sign out',

  // ProductCategories
  'categories.title': 'Explore Our Collections',
  'categories.subtitle': 'Curated pieces that define modern luxury',
  'categories.empty': 'Collections coming soon.',

  // SandalsSection (Featured Products)
  'featured.label': 'NEW',
  'featured.title': 'Featured Collection',
  'featured.shopWomen': "Shop Women's",
  'featured.shopMen': "Shop Men's",

  // FeaturedCollection
  'collection.season': 'SPRING/SUMMER 2026',
  'collection.title': 'The Art of Luxury',
  'collection.p1': 'This season, we present a carefully curated collection that embodies sophistication and timeless design. Each piece tells a story of craftsmanship, attention to detail, and unwavering commitment to quality.',
  'collection.p2': 'From hand-stitched leather goods to precision-cut garments, every item in our collection represents the pinnacle of luxury fashion. Experience the difference that true craftsmanship makes.',
  'collection.cta': 'View Collection',

  // BrandStory
  'brand.title': 'Our Philosophy',
  'brand.description': 'VNB was born from a passion for creating exceptional fashion pieces that celebrate individuality and refinement. Every item we create is a testament to our dedication to excellence and timeless style.',
  'brand.quality': 'Premium Quality',
  'brand.qualityDesc': 'Only the finest materials and craftsmanship make it into our collection.',
  'brand.design': 'Timeless Design',
  'brand.designDesc': 'Classic pieces that transcend trends and remain elegant for years to come.',
  'brand.sustainable': 'Sustainable Luxury',
  'brand.sustainableDesc': 'We believe in creating beautiful products responsibly and ethically.',

  // Newsletter
  'newsletter.title': 'Join the Vines & Branches Circle',
  'newsletter.subtitle': 'Be the first to discover new collections, exclusive offers, and styling tips. Subscribe to our newsletter and receive 10% off your first purchase.',
  'newsletter.placeholder': 'Enter your email',
  'newsletter.subscribe': 'Subscribe',
  'newsletter.subscribing': 'Subscribing...',
  'newsletter.success': 'Thank you for subscribing! Check your email for your 10% off code.',
  'newsletter.error': 'Failed to subscribe. Please try again.',
  'newsletter.consent': 'By subscribing, you agree to our Privacy Policy and consent to receive updates.',

  // Footer
  'footer.help': 'HELP',
  'footer.helpText': 'Our Client Advisors are available to assist you by phone or email.',
  'footer.chatWithUs': 'chat with us',
  'footer.services': 'SERVICES',
  'footer.about': 'ABOUT VINES & BRANCHES',
  'footer.emailSignup': 'EMAIL AND SMS SIGN-UP',
  'footer.emailSignupText': 'for exclusive email and SMS updates and receive the latest news from Vines & Branches, including new arrivals and exclusive collections.',
  'footer.followUs': 'Follow Us',
  'footer.shipTo': 'Ship to:',
  'footer.emailUs': 'EMAIL US',
  'footer.copyright': '© Vines & Branches 2026. All rights reserved.',

  // Footer links
  'footer.faqs': 'FAQs',
  'footer.productCare': 'Product Care',
  'footer.stores': 'Stores',
  'footer.repairs': 'Repairs',
  'footer.personalization': 'Personalization',
  'footer.artOfGifting': 'Art of Gifting',
  'footer.downloadApps': 'Download our Apps',
  'footer.fashionShows': 'Fashion Shows',
  'footer.artsCulture': 'Arts & Culture',
  'footer.laMaison': 'La Maison',
  'footer.sustainability': 'Sustainability',
  'footer.latestNews': 'Latest News',
  'footer.careers': 'Careers',
  'footer.foundation': 'Foundation Vines & Branches',

  // Cart
  'cart.title': 'Shopping Bag',
  'cart.empty': 'Your shopping bag is empty',
  'cart.emptyDesc': 'Looks like you haven\'t added anything to your bag yet.',
  'cart.startShopping': 'Start Shopping',
  'cart.subtotal': 'Subtotal',
  'cart.tax': 'Estimated Tax',
  'cart.total': 'Total',
  'cart.checkout': 'PROCEED TO CHECKOUT',
  'cart.freeShipping': 'Free Shipping',
  'cart.freeShippingDesc': 'On all orders',
  'cart.easyReturns': 'Easy Returns',
  'cart.easyReturnsDesc': '30-day return policy',
  'cart.securePayment': 'Secure Payment',
  'cart.securePaymentDesc': 'Encrypted checkout',

  // Product Detail
  'product.addToBag': 'ADD TO BAG',
  'product.sizeGuide': 'Size guide',
  'product.outOfStock': 'Out of stock',
  'product.lowStock': 'Only {count} left',
  'product.inStock': 'In stock',
  'product.description': 'Description',
  'product.size': 'Size',

  // Checkout
  'checkout.title': 'Checkout',
  'checkout.contact': 'Contact Information',
  'checkout.delivery': 'Delivery Address',
  'checkout.orderSummary': 'Order Summary',
  'checkout.continueToPay': 'Continue to Payment',

  // Account
  'account.signIn': 'Sign In',
  'account.createAccount': 'Create Account',
  'account.email': 'Email Address',
  'account.password': 'Password',
  'account.firstName': 'First Name',
  'account.lastName': 'Last Name',

  // Common
  'common.loading': 'Loading...',
  'common.error': 'Something went wrong',
  'common.retry': 'Try Again',
  'common.back': 'Back',
  'common.continueShopping': 'Continue Shopping',
  'common.free': 'Free',

  // Currency Prompt
  'currency.visiting': 'Visiting from {country}?',
  'currency.switchTo': 'Switch prices to {symbol} ({code}) for a localised experience.',
  'currency.switchBtn': 'Switch to {symbol}',
  'currency.keepGHS': 'Keep GH₵',

  // Search
  'search.placeholder': 'Search products...',
  'search.noResults': 'No products found',
  'search.showingResults': 'Showing 8 of {count} results',

  // Contact Page
  'contact.heading': 'Contact Us',
  'contact.subtitle': "We'd love to hear from you. Get in touch with our team.",
  'contact.getInTouch': 'Get In Touch',
  'contact.intro': 'Whether you have a question about our products, need assistance with an order, or just want to learn more about VNB, our team is here to help.',
  'contact.visitUs': 'Visit Us',
  'contact.callUs': 'Call Us',
  'contact.emailUs': 'Email Us',
  'contact.businessHours': 'Business Hours',
  'contact.sendMessage': 'Send Us a Message',
  'contact.fullName': 'Full Name',
  'contact.email': 'Email Address',
  'contact.phone': 'Phone Number',
  'contact.subject': 'Subject',
  'contact.message': 'Message',
  'contact.send': 'Send Message',
  'contact.sending': 'Sending...',
  'contact.success': 'Thank you for your message. We will get back to you soon!',
  'contact.error': 'Failed to send message. Please try again.',

  // Contact Sidebar
  'contactSidebar.welcome': 'Wherever you are, VNBWAY Client Advisors will be delighted to assist you.',
  'contactSidebar.needHelp': 'Need Help?',
  'contactSidebar.faq': 'FAQ',
  'contactSidebar.careServices': 'Care Services',
  'contactSidebar.findStore': 'Find a Store',
} as const;

const fr: Record<keyof typeof en, string> = {
  // Hero
  'hero.tagline': 'Luxe Africain Intemporel',
  'hero.shopNow': 'Acheter',

  // Navigation
  'nav.contactUs': 'Nous Contacter',
  'nav.invest': 'Investir',
  'nav.myAccount': 'Mon Compte',
  'nav.signOut': 'Déconnexion',

  // ProductCategories
  'categories.title': 'Explorez Nos Collections',
  'categories.subtitle': 'Des pièces soigneusement sélectionnées qui définissent le luxe moderne',
  'categories.empty': 'Collections bientôt disponibles.',

  // SandalsSection
  'featured.label': 'NOUVEAU',
  'featured.title': 'Collection en Vedette',
  'featured.shopWomen': 'Boutique Femme',
  'featured.shopMen': 'Boutique Homme',

  // FeaturedCollection
  'collection.season': 'PRINTEMPS/ÉTÉ 2026',
  'collection.title': "L'Art du Luxe",
  'collection.p1': "Cette saison, nous présentons une collection soigneusement sélectionnée qui incarne la sophistication et le design intemporel. Chaque pièce raconte une histoire de savoir-faire, d'attention aux détails et d'engagement envers la qualité.",
  'collection.p2': "Des articles en cuir cousus main aux vêtements taillés avec précision, chaque article de notre collection représente le summum de la mode de luxe. Découvrez la différence que fait un vrai savoir-faire.",
  'collection.cta': 'Voir la Collection',

  // BrandStory
  'brand.title': 'Notre Philosophie',
  'brand.description': "VNB est né d'une passion pour la création de pièces de mode exceptionnelles qui célèbrent l'individualité et le raffinement. Chaque article que nous créons témoigne de notre dévouement à l'excellence et au style intemporel.",
  'brand.quality': 'Qualité Supérieure',
  'brand.qualityDesc': 'Seuls les matériaux et le savoir-faire les plus fins font partie de notre collection.',
  'brand.design': 'Design Intemporel',
  'brand.designDesc': 'Des pièces classiques qui transcendent les tendances et restent élégantes au fil des années.',
  'brand.sustainable': 'Luxe Durable',
  'brand.sustainableDesc': 'Nous croyons en la création de beaux produits de manière responsable et éthique.',

  // Newsletter
  'newsletter.title': 'Rejoignez le Cercle Vines & Branches',
  'newsletter.subtitle': 'Soyez le premier à découvrir les nouvelles collections, les offres exclusives et les conseils de style. Abonnez-vous à notre newsletter et recevez 10% de réduction sur votre premier achat.',
  'newsletter.placeholder': 'Entrez votre email',
  'newsletter.subscribe': "S'abonner",
  'newsletter.subscribing': 'Inscription...',
  'newsletter.success': 'Merci de votre abonnement ! Vérifiez votre email pour votre code de réduction de 10%.',
  'newsletter.error': "Échec de l'inscription. Veuillez réessayer.",
  'newsletter.consent': 'En vous abonnant, vous acceptez notre Politique de Confidentialité et consentez à recevoir des mises à jour.',

  // Footer
  'footer.help': 'AIDE',
  'footer.helpText': 'Nos conseillers sont disponibles pour vous assister par téléphone ou email.',
  'footer.chatWithUs': 'discuter avec nous',
  'footer.services': 'SERVICES',
  'footer.about': 'À PROPOS DE VINES & BRANCHES',
  'footer.emailSignup': 'INSCRIPTION EMAIL ET SMS',
  'footer.emailSignupText': "pour des mises à jour exclusives par email et SMS et recevez les dernières nouvelles de Vines & Branches, y compris les nouveautés et les collections exclusives.",
  'footer.followUs': 'Suivez-nous',
  'footer.shipTo': 'Livraison vers :',
  'footer.emailUs': 'CONTACTEZ-NOUS',
  'footer.copyright': '© Vines & Branches 2026. Tous droits réservés.',

  // Footer links
  'footer.faqs': 'FAQ',
  'footer.productCare': 'Entretien des Produits',
  'footer.stores': 'Boutiques',
  'footer.repairs': 'Réparations',
  'footer.personalization': 'Personnalisation',
  'footer.artOfGifting': "L'Art d'Offrir",
  'footer.downloadApps': 'Télécharger nos Apps',
  'footer.fashionShows': 'Défilés de Mode',
  'footer.artsCulture': 'Arts & Culture',
  'footer.laMaison': 'La Maison',
  'footer.sustainability': 'Développement Durable',
  'footer.latestNews': 'Dernières Nouvelles',
  'footer.careers': 'Carrières',
  'footer.foundation': 'Fondation Vines & Branches',

  // Cart
  'cart.title': 'Panier',
  'cart.empty': 'Votre panier est vide',
  'cart.emptyDesc': "Il semble que vous n'ayez encore rien ajouté à votre panier.",
  'cart.startShopping': 'Commencer vos Achats',
  'cart.subtotal': 'Sous-total',
  'cart.tax': 'Taxes Estimées',
  'cart.total': 'Total',
  'cart.checkout': 'PASSER LA COMMANDE',
  'cart.freeShipping': 'Livraison Gratuite',
  'cart.freeShippingDesc': 'Sur toutes les commandes',
  'cart.easyReturns': 'Retours Faciles',
  'cart.easyReturnsDesc': 'Politique de retour de 30 jours',
  'cart.securePayment': 'Paiement Sécurisé',
  'cart.securePaymentDesc': 'Paiement crypté',

  // Product Detail
  'product.addToBag': 'AJOUTER AU PANIER',
  'product.sizeGuide': 'Guide des tailles',
  'product.outOfStock': 'Rupture de stock',
  'product.lowStock': 'Plus que {count} en stock',
  'product.inStock': 'En stock',
  'product.description': 'Description',
  'product.size': 'Taille',

  // Checkout
  'checkout.title': 'Paiement',
  'checkout.contact': 'Informations de Contact',
  'checkout.delivery': 'Adresse de Livraison',
  'checkout.orderSummary': 'Récapitulatif de la Commande',
  'checkout.continueToPay': 'Continuer vers le Paiement',

  // Account
  'account.signIn': 'Connexion',
  'account.createAccount': 'Créer un Compte',
  'account.email': 'Adresse Email',
  'account.password': 'Mot de Passe',
  'account.firstName': 'Prénom',
  'account.lastName': 'Nom',

  // Common
  'common.loading': 'Chargement...',
  'common.error': "Quelque chose s'est mal passé",
  'common.retry': 'Réessayer',
  'common.back': 'Retour',
  'common.continueShopping': 'Continuer les Achats',
  'common.free': 'Gratuit',

  // Currency Prompt
  'currency.visiting': 'Vous visitez depuis {country} ?',
  'currency.switchTo': 'Afficher les prix en {symbol} ({code}) pour une expérience locale.',
  'currency.switchBtn': 'Passer en {symbol}',
  'currency.keepGHS': 'Garder GH₵',

  // Search
  'search.placeholder': 'Rechercher des produits...',
  'search.noResults': 'Aucun produit trouvé',
  'search.showingResults': 'Affichage de 8 sur {count} résultats',

  // Contact Page
  'contact.heading': 'Nous Contacter',
  'contact.subtitle': 'Nous serions ravis de vous entendre. Contactez notre équipe.',
  'contact.getInTouch': 'Prenez Contact',
  'contact.intro': "Que vous ayez une question sur nos produits, besoin d'aide avec une commande ou que vous souhaitiez en savoir plus sur VNB, notre équipe est là pour vous aider.",
  'contact.visitUs': 'Rendez-nous Visite',
  'contact.callUs': 'Appelez-nous',
  'contact.emailUs': 'Envoyez-nous un Email',
  'contact.businessHours': "Heures d'Ouverture",
  'contact.sendMessage': 'Envoyez-nous un Message',
  'contact.fullName': 'Nom Complet',
  'contact.email': 'Adresse Email',
  'contact.phone': 'Numéro de Téléphone',
  'contact.subject': 'Sujet',
  'contact.message': 'Message',
  'contact.send': 'Envoyer le Message',
  'contact.sending': 'Envoi en cours...',
  'contact.success': 'Merci pour votre message. Nous vous répondrons bientôt !',
  'contact.error': "Échec de l'envoi du message. Veuillez réessayer.",

  // Contact Sidebar
  'contactSidebar.welcome': 'Où que vous soyez, les conseillers VNBWAY seront ravis de vous assister.',
  'contactSidebar.needHelp': "Besoin d'Aide ?",
  'contactSidebar.faq': 'FAQ',
  'contactSidebar.careServices': "Services d'Entretien",
  'contactSidebar.findStore': 'Trouver une Boutique',
};

export const translations: Record<Language, Record<string, string>> = { en, fr };
