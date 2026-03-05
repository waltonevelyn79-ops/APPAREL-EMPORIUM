import { Building2, Globe, Users, Trophy, Target, Eye, Heart } from 'lucide-react';
import Certifications from '@/components/home/Certifications';

export default function AboutPage() {
    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen">
            {/* Hero */}
            <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://image.pollinations.ai/prompt/garment%20factory%20interior%20clean%20modern%20apparel%20manufacturing?width=1920&height=1080&nologo=true')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">About Apparel Emporium</h1>
                    <p className="text-xl md:text-2xl text-gray-300">
                        100% Export Oriented Readymade Garments, Home Textiles, Footwear and Accessories Buying House.
                    </p>
                </div>
            </div>

            {/* Our Story */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="bg-white dark:bg-dark-surface p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 -mt-20 relative z-20">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Journey</h2>
                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                            <p>
                                Spending many years in the field of readymade garments, home textiles, footwear and accessories we, highly experienced professional team understand and realize the problems which most of the overseas buyers are facing today and to provide the right solutions we formed Apparel Emporium, Trading Company in 2015 widely known as Buying House in Dhaka, Bangladesh.
                            </p>
                            <p>
                                As a trusted and reliable Trading Company we source overseas Buyers/Importers to deal with merchandise as on their requirements from query to ship-out through our experienced professionals and trade associates on those sectors. We consistently try to maintain the best price, quality standard and on time shipment as on mutual understanding.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission, Vision, Values */}
            <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <Target className="w-12 h-12 text-secondary mb-6 block" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Our mission is to source locally leading manufacturers and export readymade garments, home textiles, footwear and accessories to international customers/buyers.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <Eye className="w-12 h-12 text-secondary mb-6 block" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Our vision is to be a premier Buying House to merchandise readymade garments, home textiles, footwear and accessories to international customers/buyers.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <Heart className="w-12 h-12 text-secondary mb-6 block" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                We value our professionals, buyers, associated manufacturers and other trade associates more than anything else. We love the people, commitment, integrity, trust, customer satisfaction and teamwork.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-primary text-white">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <Building2 className="w-12 h-12 text-secondary mx-auto mb-4" />
                            <div className="text-4xl font-bold mb-2">10+</div>
                            <div className="text-blue-100 text-sm">Years Excellence</div>
                        </div>
                        <div className="text-center">
                            <Globe className="w-12 h-12 text-secondary mx-auto mb-4" />
                            <div className="text-4xl font-bold mb-2">5+</div>
                            <div className="text-blue-100 text-sm">Countries Exported</div>
                        </div>
                        <div className="text-center">
                            <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
                            <div className="text-4xl font-bold mb-2">100%</div>
                            <div className="text-blue-100 text-sm">Export Oriented</div>
                        </div>
                        <div className="text-center">
                            <Trophy className="w-12 h-12 text-secondary mx-auto mb-4" />
                            <div className="text-4xl font-bold mb-2">100%</div>
                            <div className="text-blue-100 text-sm">Client Satisfaction</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Infrastructure & Capabilities */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
                        Production Arrangement Capacity
                    </h2>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        <div className="rounded-2xl overflow-hidden shadow-lg h-120 bg-gray-200 dark:bg-gray-800">
                            <img src="https://image.pollinations.ai/prompt/apparel%20manufacturing%20factory%20team%20working%20quality%20control%20clean?width=800&height=1000&nologo=true" alt="Factory team working" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">State-of-the-Art Partner Facilities</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
                                Our locally leading manufacturers are capable of serving each order based on the best price, quantity, quality, time delivery, and support. We monitor and extend necessary cooperation to fulfill merchandising requirements in due time against any order.
                            </p>
                            <ul className="space-y-4">
                                {['Readymade Garments Manufacturers (Knit, Woven and Sweater for Men, Women and Children)', 'Home Textiles Manufacturers (Bedding, Curtains and Terry Towel)', 'Footwear Manufacturers (Canvas Shoes, Basic Espadrilles and Fashion Espadrilles)', 'Accessories Manufacturers (Scarves, Hats/Caps, Gloves, Socks and Gift Box)'].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-gray-700 dark:text-gray-300 font-medium">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-secondary flex-shrink-0"></div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">Export Destinations</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
                                Apparel Emporium is dealing with buyers from: Canada, Japan, Saudi Arabia, Oman, and Sweden.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Certs */}
            <Certifications data={null} />

        </div>
    );
}
