import { Target, Zap, CheckCircle2 } from 'lucide-react';

export const metadata = {
    title: 'Support - Apparel Emporium',
    description: 'Our trade support service details for international buyers.',
};

export default function SupportPage() {
    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen py-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Our Trade Support Service</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Our well trained, experienced, expert and diverse professional team is capable of Merchandising, Sampling, Production, Quality Control, Banking and Shipping and ready to provide you the best trade support service by their in-depth understanding and knowledge to fulfill your requirements. Never miss an important message with instant notifications.
                    </p>
                </div>

                <div className="bg-white dark:bg-dark-surface p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">Our Best Trade Support Service includes:</h2>

                    <ul className="space-y-6">
                        {[
                            'Look forward to fulfill the readymade garments, home textiles, footwear and accessories business needs to international Buyers/Importers.',
                            'Build up a good relationship with international Buyers in business development, production and sampling program.',
                            'Source and identifying the locally leading manufacturers in respect of each query to make us capable of serving each order based on best price, quantity, quality, time delivery, support and alike.',
                            'Evaluate the manufacturers regarding compliance as per of International Buyers requirements.',
                            'Keep continue the relationship with locally leading manufacturers by providing them good guidance in implementing effective manufacturing management procedures.',
                            'Monitor and extend necessary cooperation to locally leading manufacturers to fulfill their Merchandising requirements in due time against any order.',
                            'Follow-up the manufacturers and set final inspection of all the goods as per the AQL quality standards required by the Buyers.',
                            'Check the merchandise quality time to time and oversee corrective actions when necessary to ensure and preserve the right quality and never take the shortcut follow up on quality.',
                            'Execute the effective quality control Management Information System so that Buyers can get up-to-date information of their offered orders.',
                            'Evaluate and monitoring our services and oversee corrective actions when necessary.'
                        ].map((item, idx) => (
                            <li key={idx} className="flex gap-4 items-start bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow">
                                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-primary">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{item}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

