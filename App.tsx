
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getPolicyAdvice, generateProductImage } from './services/geminiService';
import { Product, ServiceItem, PriceData, SmartTab, ViewState, MarketItem } from './types';

// --- Data Configuration ---

const SHUANGCHENG_PRODUCTS: Product[] = [
  { 
      id: 101, 
      name: "民和鲜食玉米 (甜糯)", 
      price: "¥2.5/根", 
      category: "东北粮食", 
      origin: "哈尔滨市双城区", 
      image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=500&q=60",
      aiPrompt: "Fresh yellow sweet corn on the cob, farm background, close up, high resolution",
      tags: ["当日采摘", "真空锁鲜"]
  },
  { 
      id: 102, 
      name: "农家散养土鸡蛋", 
      price: "¥22/kg", 
      category: "禽畜肉蛋", 
      origin: "哈尔滨市双城区", 
      image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=500&q=60", // Updated to Chicken image
      aiPrompt: "One brown hen walking on a farm field, close up, realistic, high quality, single chicken",
      tags: ["林下散养", "无抗生素"]
  },
  { 
      id: 103, 
      name: "暖水水稻 (长粒香)", 
      price: "¥5.5/斤", 
      category: "东北粮食", 
      origin: "哈尔滨市双城区", 
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=60",
      aiPrompt: "Bowl of uncooked white rice with paddy field background, premium quality",
      tags: ["由暖水河灌溉", "一年一季"]
  },
  { 
      id: 104, 
      name: "双城有机果蔬箱", 
      price: "¥45/箱", 
      category: "新鲜果蔬", 
      origin: "哈尔滨市双城区", 
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=60",
      aiPrompt: "Box of assorted fresh vegetables tomatoes cucumbers peppers, harvest theme",
      tags: ["绿色认证", "基地直供"]
  },
  { 
      id: 105, 
      name: "双城笨榨豆油", 
      price: "¥60/桶", 
      category: "东北粮食", 
      origin: "哈尔滨市双城区", 
      image: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=500&q=60",
      aiPrompt: "Bottle of golden soybean oil, agricultural background",
      tags: ["非转基因", "古法压榨"]
  },
   { 
      id: 106, 
      name: "本地红皮洋葱", 
      price: "¥1.2/斤", 
      category: "新鲜果蔬", 
      origin: "哈尔滨市双城区", 
      image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=500&q=60",
      aiPrompt: "Fresh red onions pile, market style",
      tags: ["耐储存", "口感辛辣"]
  }
];

const SERVICE_ITEMS: ServiceItem[] = [
    {
        id: 'planting',
        title: "种植托管", 
        icon: "fa-seedling", 
        description: "从种到收全程托管，专业团队科学种植，让您省心省力。",
        details: "针对东北黑土地特性，提供全周期的土地托管服务。包括：测土配方施肥（双城实验室）、优选寒地良种、大型机械化播种收割、无人机飞防。我们承诺每亩增产10%以上。"
    },
    {
        id: 'drone',
        title: "植保无人机", 
        icon: "fa-plane-up", 
        description: "高效精准喷洒作业，病虫害统防统治，降低成本提高效率。",
        details: "采用最新型大疆农业无人机，配备专业飞手团队。服务内容包含：农作物病虫害防治、叶面肥喷洒、播种作业。作业效率是传统人工的50倍，药液利用率提升30%。"
    },
    {
        id: 'training',
        title: "农业培训", 
        icon: "fa-chalkboard-user", 
        description: "专家田间授课，线上线下结合，培养高素质新型职业农民。",
        details: "联合东北农业大学专家教授，定期举办农业技术培训班。课程涵盖：现代农业种植技术、病虫害识别与防治、农机操作与维护、农业经营管理。学员可获得结业证书。"
    },
    {
        id: 'supply',
        title: "种药肥供应", 
        icon: "fa-flask", 
        description: "优质农资集采直供，源头把控质量，价格更优，配送到户。",
        details: "与国内外知名农资企业直接合作，杜绝假冒伪劣农资。主要供应：玉米/水稻良种、复合肥/有机肥、高效低毒农药。提供团购优惠，双城区内免费配送上门。"
    }
];

// Mock Data Generator
const generateTrend = (base: number, variance: number) => {
    return Array.from({length: 7}).map((_, i) => ({
        day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
        price: Number((base + (Math.random() * variance * 2 - variance)).toFixed(2))
    }));
};

const MARKET_DATA = {
    '玉米': {
        trend: generateTrend(1.12, 0.03),
        items: [
            { name: "干粮玉米", spec: "14水", price: 1.12, unit: "元/斤", change: 0.5 },
            { name: "潮粮玉米", spec: "30水", price: 0.88, unit: "元/斤", change: -0.1 },
            { name: "玉米芯", spec: "干", price: 300, unit: "元/吨", change: 0.0 }
        ],
        analysis: "受近期雨雪天气影响，双城地区玉米上量放缓，深加工企业提价补库，预计未来一周价格稳中偏强。"
    },
    '大米': {
        trend: generateTrend(1.65, 0.05),
        items: [
             { name: "长粒香水稻", spec: "国标一等", price: 1.65, unit: "元/斤", change: -0.2 },
             { name: "圆粒水稻", spec: "国标二等", price: 1.45, unit: "元/斤", change: 0.1 },
             { name: "碎米", spec: "-", price: 1.10, unit: "元/斤", change: 0.0 }
        ],
        analysis: "市场需求平稳，大米走货速度一般，价格波动不大。"
    },
    '鸡蛋': {
        trend: generateTrend(4.20, 0.15),
         items: [
             { name: "大码红皮鸡蛋", spec: "45斤/箱", price: 4.20, unit: "元/斤", change: 1.2 },
             { name: "粉壳蛋", spec: "45斤/箱", price: 4.35, unit: "元/斤", change: 0.8 },
             { name: "淘汰鸡", spec: "老鸡", price: 5.50, unit: "元/斤", change: -0.5 }
        ],
        analysis: "临近节日，食品厂备货积极，鸡蛋需求增加，价格呈现上涨趋势。"
    },
    '果蔬': {
        trend: generateTrend(1.5, 0.3),
         items: [
             { name: "地产白菜", spec: "净菜", price: 0.45, unit: "元/斤", change: 0.0 },
             { name: "红皮洋葱", spec: "7.0+", price: 1.20, unit: "元/斤", change: 2.1 },
             { name: "土豆", spec: "3两以上", price: 0.90, unit: "元/斤", change: -1.0 }
        ],
        analysis: "本地大棚蔬菜上市量增加，叶菜类价格有所回落，根茎类价格坚挺。"
    }
};

const CATEGORIES = [
  { name: "东北粮食", icon: "fa-wheat-awn" },
  { name: "新鲜果蔬", icon: "fa-apple-whole" },
  { name: "禽畜肉蛋", icon: "fa-egg" },
  { name: "水产海鲜", icon: "fa-fish" },
  { name: "农资农机", icon: "fa-tractor" },
  { name: "种子种苗", icon: "fa-seedling" },
  { name: "中药材", icon: "fa-mortar-pestle" },
  { name: "土地流转", icon: "fa-map-location-dot" },
];

// --- Sub Components ---

const GeminiImage = ({ src, alt, aiPrompt, className }: { src: string, alt: string, aiPrompt?: string, className?: string }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);

    const handleGenerate = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (!aiPrompt || loading) return;
        setLoading(true);
        const newImage = await generateProductImage(aiPrompt);
        if (newImage) {
            setImgSrc(newImage);
            setGenerated(true);
        }
        setLoading(false);
    };

    return (
        <div className="relative h-full w-full">
            <img src={imgSrc} alt={alt} className={className} />
            {aiPrompt && !generated && (
                <button 
                    onClick={handleGenerate}
                    className="absolute bottom-2 right-2 bg-purple-600/90 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded-full shadow backdrop-blur-sm flex items-center gap-1 transition z-10"
                    disabled={loading}
                >
                    {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                    {loading ? '生成中...' : 'AI 生成'}
                </button>
            )}
             {generated && (
                <span className="absolute bottom-2 right-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded-full shadow backdrop-blur-sm z-10">
                    <i className="fa-solid fa-check"></i> AI Created
                </span>
            )}
        </div>
    );
};

// --- View Components ---

const PriceMonitoringSection = () => {
    const [activeTab, setActiveTab] = useState<'玉米' | '大米' | '鸡蛋' | '果蔬'>('玉米');
    const data = MARKET_DATA[activeTab];

    return (
        <section className="bg-white py-12 border-t border-gray-100 scroll-mt-24" id="price-hall">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
                        信息共享服务 · 价格监测
                    </h2>
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                        {['玉米', '大米', '鸡蛋', '果蔬'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-2 rounded-md text-sm font-bold transition ${
                                    activeTab === tab 
                                    ? 'bg-white text-purple-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Chart */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <i className="fa-solid fa-arrow-trend-up text-green-500"></i>
                            <h3 className="font-bold text-gray-700">双城区{activeTab}收购价格走势 (2025年)</h3>
                        </div>
                        <div className="h-[350px] w-full bg-gradient-to-b from-purple-50/50 to-transparent rounded-xl p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.trend}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#9ca3af', fontSize: 12}} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        domain={['dataMin - 0.2', 'dataMax + 0.2']} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#9ca3af', fontSize: 12}} 
                                    />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                        itemStyle={{color: '#9333ea', fontWeight: 'bold'}}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="#9333ea" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorPrice)" 
                                        activeDot={{r: 6, strokeWidth: 0}}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right: List & AI */}
                    <div className="flex flex-col gap-6">
                        {/* Price List */}
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 mb-4">今日双城市场行情</h3>
                            <div className="space-y-3">
                                {data.items.map((item, idx) => (
                                    <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition">
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm">{item.name} <span className="text-xs text-gray-400 font-normal">({item.spec})</span></div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900">{item.price.toFixed(2)} <span className="text-xs text-gray-400 font-normal">{item.unit}</span></div>
                                            <div className={`text-xs font-bold ${item.change > 0 ? 'text-red-500' : item.change < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                                                {item.change > 0 ? '+' : ''}{item.change}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Analysis */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 relative">
                            <div className="flex items-center gap-2 mb-2">
                                <i className="fa-solid fa-robot text-blue-600"></i>
                                <span className="text-xs font-bold text-blue-800">AI 行情分析:</span>
                            </div>
                            <p className="text-xs text-blue-900 leading-relaxed">
                                {data.analysis}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const HomeView = ({ setView, setCurrentProduct, setCurrentService }: { 
    setView: (v: ViewState) => void, 
    setCurrentProduct: (p: Product) => void,
    setCurrentService: (s: ServiceItem) => void
}) => (
    <>
        <div className="bg-gray-100 pb-8">
            <div className="max-w-7xl mx-auto flex h-[420px]">
                {/* Sidebar Category */}
                <div className="w-56 bg-white shadow-sm flex-shrink-0 z-10 flex flex-col">
                    <div className="bg-green-600 text-white font-bold px-4 py-3">
                        <i className="fa-solid fa-list mr-2"></i> 商品分类
                    </div>
                    <ul className="flex-1 overflow-y-auto">
                        {CATEGORIES.map((cat, idx) => (
                            <li 
                                key={idx} 
                                onClick={() => setView('MALL')}
                                className="px-4 py-3 hover:bg-green-50 hover:text-green-600 cursor-pointer border-b border-gray-50 last:border-0 text-sm flex items-center justify-between group transition"
                            >
                                <span className="flex items-center gap-3">
                                    <i className={`fa-solid ${cat.icon} w-5 text-gray-400 group-hover:text-green-500`}></i>
                                    {cat.name}
                                </span>
                                <i className="fa-solid fa-angle-right text-xs text-gray-300"></i>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Center Banner */}
                <div className="flex-1 relative overflow-hidden group ml-4">
                    <img 
                        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80" 
                        alt="Agriculture Banner" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end px-12 pb-12">
                        <div className="text-white">
                            <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">民和供销 · 智慧兴农</h2>
                            <p className="text-2xl mb-6 drop-shadow-md">农业绿色发展 · 乡村振兴先行</p>
                            <div className="flex gap-4">
                                <button onClick={() => setView('RECYCLE_FORM')} className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition shadow-lg transform hover:-translate-y-1">
                                    农户申报回收
                                </button>
                                <button onClick={() => { document.getElementById('price-hall')?.scrollIntoView({behavior:'smooth'}) }} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg transform hover:-translate-y-1">
                                    查看今日行情
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-64 bg-white flex flex-col p-4 ml-4 h-full shadow-sm">
                    <div className="mb-4 bg-green-50 p-3 rounded border border-green-100">
                        <h4 className="font-bold text-green-800 text-sm mb-2">平台公告</h4>
                        <ul className="text-xs text-gray-600 space-y-2">
                            <li className="truncate">• 2025年春耕补贴政策解读...</li>
                            <li className="truncate">• 关于废旧地膜回收的通知...</li>
                            <li className="truncate">• 双城区有机玉米收购开启...</li>
                        </ul>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <i className="fa-solid fa-store text-2xl text-green-600"></i>
                        </div>
                        <h3 className="font-bold text-gray-800">民和商城</h3>
                        <p className="text-xs text-gray-500 mb-4">源头好货 一站直达</p>
                        <button onClick={() => setView('MALL')} className="text-sm border border-green-600 text-green-600 px-6 py-1 rounded-full hover:bg-green-600 hover:text-white transition">
                            去逛逛
                        </button>
                    </div>

                    <div className="mt-4 border-t pt-4">
                         <h4 className="text-orange-600 font-bold text-sm mb-2 text-center">重点招商类目</h4>
                         <div className="grid grid-cols-2 gap-2">
                             <div className="bg-orange-50 text-orange-700 text-xs text-center py-2 rounded">鲜食玉米</div>
                             <div className="bg-orange-50 text-orange-700 text-xs text-center py-2 rounded">散养禽蛋</div>
                             <div className="bg-orange-50 text-orange-700 text-xs text-center py-2 rounded">中药材</div>
                             <div className="bg-orange-50 text-orange-700 text-xs text-center py-2 rounded">有机肥</div>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Strict Selection */}
        <section className="max-w-7xl mx-auto py-12 px-4">
            <div className="flex items-end justify-between mb-8">
                 <div className="flex items-end gap-3">
                    <h2 className="text-3xl font-bold text-gray-800 border-l-8 border-green-600 pl-4">严选好货</h2>
                    <span className="text-gray-500 pb-1">哈尔滨市双城区 · 地标认证</span>
                </div>
                <button onClick={() => setView('MALL')} className="text-gray-500 hover:text-green-600">查看更多 <i className="fa-solid fa-angle-right"></i></button>
            </div>
           
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {SHUANGCHENG_PRODUCTS.slice(0, 4).map(product => (
                    <div 
                        key={product.id} 
                        onClick={() => { setCurrentProduct(product); setView('PRODUCT_DETAIL'); }}
                        className="bg-white rounded-xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden group border border-gray-100 cursor-pointer"
                    >
                        <div className="h-64 overflow-hidden relative bg-gray-100">
                             <GeminiImage 
                                src={product.image} 
                                alt={product.name} 
                                aiPrompt={product.aiPrompt}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                 <span className="bg-green-600 text-white text-xs px-2 py-1 rounded shadow opacity-90">{product.origin}</span>
                                 {product.tags?.map((tag, i) => (
                                     <span key={i} className="bg-orange-500 text-white text-xs px-2 py-1 rounded shadow opacity-90">{tag}</span>
                                 ))}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 truncate group-hover:text-green-600 transition">{product.name}</h3>
                            <div className="flex items-end justify-between">
                                <div>
                                    <span className="text-red-600 font-bold text-2xl">{product.price.split('/')[0]}</span>
                                    <span className="text-gray-400 text-sm">/{product.price.split('/')[1]}</span>
                                </div>
                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">{product.category}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Services Teaser */}
        <section className="bg-gray-50 py-12 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4">
                 <div className="flex items-end justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 border-l-8 border-green-600 pl-4">农业服务 (可点击详情)</h2>
                    <p className="text-gray-500 pb-1">双城区一站式农业生产托管与技术支持中心</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {SERVICE_ITEMS.map((s, i) => (
                        <div 
                            key={i} 
                            onClick={() => { setCurrentService(s); setView('SERVICE_DETAIL'); }}
                            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 cursor-pointer transition transform hover:-translate-y-2 group"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 text-2xl mb-6 group-hover:bg-green-600 group-hover:text-white transition">
                                <i className={`fa-solid ${s.icon}`}></i>
                            </div>
                            <h4 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-green-600">{s.title}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{s.description}</p>
                            <div className="mt-4 flex items-center text-green-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition">
                                查看服务详情 <i className="fa-solid fa-arrow-right ml-2"></i>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Smart Platform */}
        <div id="smart" className="bg-gray-50 border-t border-gray-200">
             <SmartPlatform setView={setView} />
        </div>

        {/* Price Trends - Now in Home */}
        <PriceMonitoringSection />
    </>
);

const ServiceDetailView = ({ service, goBack }: { service: ServiceItem, goBack: () => void }) => (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
            <button onClick={goBack} className="mb-6 text-gray-500 hover:text-green-600 flex items-center gap-2">
                <i className="fa-solid fa-arrow-left"></i> 返回首页
            </button>
            
            {/* Header Micro-page Style */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-t-3xl p-12 text-white relative overflow-hidden shadow-lg">
                <div className="absolute right-0 top-0 opacity-10 text-[200px] leading-none -mr-10 -mt-10">
                    <i className={`fa-solid ${service.icon}`}></i>
                </div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                         <i className={`fa-solid ${service.icon} text-5xl`}></i>
                    </div>
                    <div>
                        <h1 className="text-5xl font-bold mb-2">{service.title}</h1>
                        <p className="text-green-100 text-xl">双城区标准化农业服务项目</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-b-3xl shadow-sm border border-t-0 border-gray-200 p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-l-4 border-green-500 pl-4">
                            服务详情
                        </h3>
                        <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                            {service.details}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                         <div className="bg-gray-50 p-6 rounded-xl flex items-start gap-4">
                            <i className="fa-solid fa-circle-check text-green-500 text-xl mt-1"></i>
                            <div>
                                <h4 className="font-bold text-gray-800">官方背书</h4>
                                <p className="text-sm text-gray-500 mt-1">供销社全程监管，服务质量有保障</p>
                            </div>
                         </div>
                         <div className="bg-gray-50 p-6 rounded-xl flex items-start gap-4">
                            <i className="fa-solid fa-circle-check text-green-500 text-xl mt-1"></i>
                            <div>
                                <h4 className="font-bold text-gray-800">价格透明</h4>
                                <p className="text-sm text-gray-500 mt-1">无隐形消费，签订正规服务合同</p>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">联系咨询</h4>
                        
                        <div className="space-y-6">
                             <div>
                                <p className="text-xs text-gray-500 mb-1">咨询热线</p>
                                <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                                    <i className="fa-solid fa-phone"></i> 0451-53270777
                                </p>
                                <p className="text-xs text-gray-400 mt-1">工作时间: 08:30 - 17:00</p>
                             </div>

                             <div>
                                <p className="text-xs text-gray-500 mb-1">办理地址</p>
                                <p className="text-sm text-gray-700 flex items-start gap-2">
                                     <i className="fa-solid fa-location-dot mt-1 text-gray-400"></i>
                                     双城区转盘道现代农事综合服务中心
                                </p>
                             </div>
                        </div>

                        <div className="mt-8 bg-gray-50 rounded-lg p-4 text-center">
                            <button className="w-full bg-gray-100 text-gray-500 font-bold py-3 rounded-lg cursor-not-allowed mb-2">
                                线上预约暂未开放
                            </button>
                            <p className="text-xs text-gray-400">请拨打电话或前往线下中心办理</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MallView = () => {
    const [activeCategory, setActiveCategory] = useState("全部");

    // Logic to filter products based on activeCategory
    const filteredProducts = activeCategory === "全部" 
        ? SHUANGCHENG_PRODUCTS 
        : SHUANGCHENG_PRODUCTS.filter(p => p.category === activeCategory);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 flex gap-6">
                {/* Mall Sidebar */}
                <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit sticky top-24">
                    <div className="p-4 border-b border-gray-100 font-bold text-gray-800">
                        <i className="fa-solid fa-filter mr-2 text-green-600"></i> 商品筛选
                    </div>
                    <ul>
                        <li 
                            onClick={() => setActiveCategory("全部")}
                            className={`px-4 py-3 cursor-pointer text-sm flex justify-between items-center ${activeCategory === "全部" ? 'bg-green-50 text-green-600 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            全部商品 <i className="fa-solid fa-angle-right text-xs opacity-50"></i>
                        </li>
                        {CATEGORIES.map((cat, idx) => (
                            <li 
                                key={idx} 
                                onClick={() => setActiveCategory(cat.name)}
                                className={`px-4 py-3 cursor-pointer text-sm flex justify-between items-center ${activeCategory === cat.name ? 'bg-green-50 text-green-600 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                                {cat.name} <i className="fa-solid fa-angle-right text-xs opacity-50"></i>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Mall Grid */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {activeCategory === "全部" ? "全部商品" : activeCategory}
                        </h2>
                        <div className="flex gap-2 text-sm text-gray-500">
                            <span>综合排序</span>
                            <span className="mx-2">|</span>
                            <span>销量</span>
                            <span className="mx-2">|</span>
                            <span>价格</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition group">
                                    <div className="h-48 overflow-hidden relative bg-gray-100">
                                        <GeminiImage 
                                            src={product.image} 
                                            alt={product.name} 
                                            aiPrompt={product.aiPrompt}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-800">{product.name}</h3>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{product.origin.replace("哈尔滨市", "")}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">{product.tags?.join(' · ')}</p>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-xl font-bold text-red-600">{product.price}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); alert(`已将 ${product.name} 加入采购单`); }}
                                                className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-700 transition shadow-sm"
                                            >
                                                <i className="fa-solid fa-cart-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="col-span-3 text-center py-12 text-gray-400">
                                <i className="fa-solid fa-box-open text-4xl mb-4"></i>
                                <p>该分类下暂无商品</p>
                            </div>
                        )}
                        
                        {/* Fake additional products filler if active category is ALL to fill grid nicely */}
                         {activeCategory === "全部" && [1,2,3].map(i => (
                            <div key={`fake-${i}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition cursor-not-allowed">
                                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                                    <i className="fa-solid fa-image text-3xl"></i>
                                </div>
                                <div className="p-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                    <div className="flex justify-between">
                                         <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                         <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const RecycleFormView = () => (
    <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">农户线上申报回收</h2>
            <p className="text-gray-500 mt-2">打通“村—乡—仓”数字链路，一键上门，现结现付</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">姓名</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none" placeholder="请输入您的姓名" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">联系电话</label>
                        <input type="tel" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none" placeholder="请输入手机号码" />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">所在地址 (手动填写)</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none" placeholder="请输入双城区详细地址（乡镇/村屯/门牌号）" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">回收/出售品类</label>
                    <div className="grid grid-cols-2 gap-4">
                        {['废旧地膜', '滴灌带', '农药包装', '秸秆', '农副产品 (玉米/大豆/水稻)'].map(item => (
                            <label key={item} className="flex items-center space-x-2 border border-gray-200 p-3 rounded-lg cursor-pointer hover:bg-green-50">
                                <input type="radio" name="type" className="text-green-600 focus:ring-green-500" />
                                <span>{item}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">预估重量/数量</label>
                    <div className="relative">
                        <input type="number" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none" placeholder="0" />
                        <span className="absolute right-4 top-3 text-gray-500">公斤/斤</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">备注说明 (替代照片上传)</label>
                    <textarea 
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none h-24" 
                        placeholder="请描述物品的具体情况、存放位置等补充信息。"
                    ></textarea>
                </div>

                <button type="button" onClick={() => alert('申报成功！工作人员将在24小时内联系您。')} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg">
                    立即提交申报
                </button>
                <p className="text-center text-xs text-gray-400">我们将保护您的个人信息安全</p>
            </form>
        </div>
    </div>
);

const ProductDetailView = ({ product, goBack }: { product: Product, goBack: () => void }) => (
    <div className="max-w-7xl mx-auto py-8 px-4">
        <button onClick={goBack} className="mb-4 text-gray-500 hover:text-green-600 flex items-center gap-1">
            <i className="fa-solid fa-arrow-left"></i> 返回列表
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="h-[400px] rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                 <GeminiImage 
                    src={product.image} 
                    alt={product.name} 
                    aiPrompt={product.aiPrompt}
                    className="w-full h-full object-cover"
                />
            </div>
            <div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">{product.origin}</span>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
                <p className="text-3xl text-red-600 font-bold mb-6">{product.price}</p>
                
                <div className="space-y-4 text-gray-600 mb-8">
                    <div className="flex">
                        <span className="w-24 text-gray-400">分类</span>
                        <span>{product.category}</span>
                    </div>
                    <div className="flex">
                        <span className="w-24 text-gray-400">认证</span>
                        <span>绿色食品A级</span>
                    </div>
                    <div className="flex">
                        <span className="w-24 text-gray-400">服务</span>
                        <span>产地直发 • 坏单包赔 • 48小时发货</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
                        立即购买
                    </button>
                    <button className="flex-1 bg-orange-100 text-orange-600 py-3 rounded-lg font-bold hover:bg-orange-200 transition">
                        加入采购单
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// --- Main App Component ---

const SmartPlatform = ({ setView }: { setView: (v: ViewState) => void }) => {
    return (
        <section className="max-w-7xl mx-auto py-12 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                    <h2 className="text-3xl font-bold text-gray-900">智慧平台核心能力</h2>
                </div>
                 <div className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                     <span className="text-gray-500 text-sm">AI 调度系统实时运行中</span>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                
                {/* LEFT: Map & Dispatch (2/3 width) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col relative overflow-hidden">
                     {/* Header */}
                     <div className="flex justify-between items-center mb-4 z-10">
                         <div className="flex items-center gap-2 text-gray-800 font-bold">
                             <i className="fa-solid fa-bolt text-blue-500"></i>
                             智能订单调度监控 (双城区域)
                         </div>
                         <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">卫星链路已连接</span>
                     </div>

                     {/* Fake Map UI */}
                     <div className="flex-1 bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100">
                         {/* Grid Pattern */}
                         <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5}}></div>
                         
                         {/* Map Elements */}
                         <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                              <span className="bg-white px-2 py-1 rounded shadow text-xs font-bold mb-1">仓储中心</span>
                              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-ping absolute opacity-50"></div>
                              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                         </div>

                         <div className="absolute bottom-1/3 right-1/4 transform translate-x-1/2 translate-y-1/2 flex flex-col items-center z-10">
                              <span className="bg-white px-2 py-1 rounded shadow text-xs font-bold mb-1">新订单</span>
                              <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg"></div>
                         </div>

                         {/* Path */}
                         <svg className="absolute inset-0 w-full h-full pointer-events-none">
                             <path d="M200 150 Q 400 250 550 350" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" className="animate-pulse"/>
                             {/* Truck Icon moving */}
                             <foreignObject x="350" y="240" width="100" height="40">
                                 <div className="bg-white px-2 py-1 rounded shadow border border-blue-200 flex items-center gap-1 text-[10px] w-fit">
                                     <i className="fa-solid fa-truck-fast text-blue-600"></i>
                                     <span className="font-bold text-blue-900">运输中</span>
                                 </div>
                             </foreignObject>
                         </svg>
                     </div>

                     {/* Floating Stats Card on Map */}
                     <div className="absolute top-20 right-8 w-48 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-blue-50 p-4 z-20">
                         <p className="text-xs text-blue-600 font-bold mb-1">今日调度效率</p>
                         <p className="text-4xl font-bold text-blue-600">98<span className="text-lg">%</span></p>
                         <div className="w-full bg-blue-100 h-1.5 rounded-full mt-2">
                             <div className="bg-blue-600 h-1.5 rounded-full" style={{width: '98%'}}></div>
                         </div>
                     </div>

                     <div className="absolute top-48 right-8 w-48 bg-orange-50/90 backdrop-blur rounded-xl shadow-lg border border-orange-100 p-4 z-20">
                         <p className="text-xs text-orange-600 font-bold mb-1">待回收申报订单</p>
                         <p className="text-3xl font-bold text-orange-600">12 <span className="text-sm">单</span></p>
                         <p className="text-[10px] text-gray-500 mt-1">双城区域平均响应：15分钟</p>
                     </div>

                     <div className="absolute bottom-8 right-8 w-48 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200 p-4 z-20">
                         <p className="text-xs text-gray-500 mb-2">车辆实时状态</p>
                         <ul className="text-xs space-y-2">
                             <li className="flex justify-between"><span>黑A·F8291</span> <span className="text-green-600 bg-green-50 px-1 rounded">运输中</span></li>
                             <li className="flex justify-between"><span>黑A·L9102</span> <span className="text-gray-500 bg-gray-100 px-1 rounded">待命</span></li>
                             <li className="flex justify-between"><span>黑A·M7782</span> <span className="text-orange-600 bg-orange-50 px-1 rounded">装货中</span></li>
                         </ul>
                     </div>
                </div>

                {/* RIGHT: Action & Policy (1/3 width) */}
                <div className="flex flex-col gap-6 h-full">
                    
                    {/* Top: Recycle Call to Action */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col justify-center h-[280px]">
                        <div className="absolute -right-4 -bottom-4 opacity-20">
                            <i className="fa-solid fa-truck text-9xl"></i>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-2xl font-bold">农户线上申报回收</h3>
                                <i className="fa-solid fa-angle-right"></i>
                            </div>
                            <p className="text-orange-100 text-sm mb-6 leading-relaxed">
                                足不出户，一键申报。统一车辆上门回收，价格透明，结算秒到账。
                            </p>
                            <button 
                                onClick={() => setView('RECYCLE_FORM')}
                                className="bg-white text-orange-600 font-bold py-3 px-6 rounded-lg shadow hover:bg-orange-50 transition w-fit"
                            >
                                点击立即申报
                            </button>
                        </div>
                    </div>

                    {/* Bottom: Policy List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                            <h3 className="font-bold flex items-center gap-2 text-gray-800">
                                <i className="fa-regular fa-bell text-red-500"></i> 政策智能推送
                            </h3>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded">2025最新</span>
                        </div>
                        
                        <div className="overflow-y-auto pr-2 space-y-4 text-sm flex-1 custom-scrollbar">
                             <div className="group cursor-pointer">
                                 <div className="flex justify-between text-xs text-gray-400 mb-1">
                                     <span className="bg-red-500 text-white px-1 rounded">补贴</span>
                                     <span>2025-03-15</span>
                                 </div>
                                 <p className="text-gray-700 font-medium hover:text-red-500 transition">
                                     2025年黑龙江省玉米大豆生产者补贴实施方案
                                 </p>
                             </div>

                             <div className="group cursor-pointer">
                                 <div className="flex justify-between text-xs text-gray-400 mb-1">
                                     <span className="bg-gray-500 text-white px-1 rounded">政策</span>
                                     <span>2025-03-10</span>
                                 </div>
                                 <p className="text-gray-700 font-medium hover:text-gray-900 transition">
                                     双城区关于推进数字农业建设的若干措施
                                 </p>
                             </div>

                             <div className="group cursor-pointer">
                                 <div className="flex justify-between text-xs text-gray-400 mb-1">
                                     <span className="bg-green-500 text-white px-1 rounded">农技</span>
                                     <span>2025-02-28</span>
                                 </div>
                                 <p className="text-gray-700 font-medium hover:text-green-600 transition">
                                     春耕备耕关键技术指导意见 (双城农技推广中心)
                                 </p>
                             </div>
                              <div className="group cursor-pointer">
                                 <div className="flex justify-between text-xs text-gray-400 mb-1">
                                     <span className="bg-blue-500 text-white px-1 rounded">通知</span>
                                     <span>2025-02-20</span>
                                 </div>
                                 <p className="text-gray-700 font-medium hover:text-blue-600 transition">
                                     关于开展废旧农膜回收利用宣传周活动的通知
                                 </p>
                             </div>
                        </div>
                         <i className="fa-solid fa-caret-down text-gray-300 mx-auto block mt-2"></i>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- App Root ---

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentService, setCurrentService] = useState<ServiceItem | null>(null);

  const handleNavClick = (v: ViewState) => {
      setView(v);
      window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        {/* Top Bar */}
        <div className="bg-gray-100 text-xs text-gray-500 py-1">
          <div className="max-w-7xl mx-auto px-4 flex justify-between">
            <div className="flex items-center space-x-4">
              <span><i className="fa-solid fa-location-dot mr-1"></i> 哈尔滨市双城区</span>
              <span className="text-green-600 font-bold">欢迎光临民和供销智慧平台！</span>
            </div>
            <div className="flex space-x-4">
              <span className="hover:text-green-600 cursor-pointer">APP下载</span>
              <span className="hover:text-green-600 cursor-pointer">客服中心</span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('HOME')}>
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-green-200 shadow-lg">
              <i className="fa-solid fa-leaf"></i>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-green-700 leading-none">民和供销</h1>
                <span className="text-xs text-gray-500 tracking-widest">MINHE SUPPLY</span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-12">
            <div className="flex">
              <input 
                type="text" 
                className="flex-1 h-10 border-2 border-green-600 px-4 focus:outline-none rounded-l-md" 
                placeholder="搜索：鲜食玉米 / 农家蛋 / 无人机植保"
              />
              <button className="h-10 px-8 bg-green-600 text-white font-medium hover:bg-green-700 rounded-r-md">
                搜索
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
                <i className="fa-brands fa-weixin text-2xl text-green-600"></i>
                <p className="text-xs text-gray-500">小程序</p>
            </div>
          </div>
        </div>

        {/* Nav Bar */}
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center text-base font-medium text-gray-700">
              <button onClick={() => handleNavClick('MALL')} className={`px-6 py-3 mr-6 font-bold flex items-center gap-2 ${view === 'MALL' ? 'bg-green-600 text-white' : 'hover:text-green-600'}`}>
                  <i className="fa-solid fa-bars"></i> 全部商品分类
              </button>
              <button onClick={() => handleNavClick('HOME')} className={`px-4 py-3 hover:text-green-600 ${view === 'HOME' ? 'text-green-600 font-bold' : ''}`}>首页</button>
              <button onClick={() => handleNavClick('MALL')} className={`px-4 py-3 hover:text-green-600 ${view === 'MALL' ? 'text-green-600 font-bold' : ''}`}>民和商城</button>
              {/* Note: In a real app this would probably toggle a menu, here we just go to first one or use Service Detail if one is active */}
              <button onClick={() => handleNavClick('SERVICE_DETAIL')} className={`px-4 py-3 hover:text-green-600 ${view === 'SERVICE_DETAIL' ? 'text-green-600 font-bold' : ''}`}>农业服务</button>
              <button onClick={() => { handleNavClick('HOME'); setTimeout(() => document.getElementById('smart')?.scrollIntoView({behavior: 'smooth'}), 100); }} className="px-4 py-3 text-orange-500 font-bold"><i className="fa-solid fa-brain mr-1"></i>智慧平台</button>
              <button onClick={() => handleNavClick('INFO_HALL')} className={`px-4 py-3 hover:text-green-600 ${view === 'INFO_HALL' ? 'text-green-600 font-bold' : ''}`}>行情大厅</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Router */}
      <main className="flex-1 bg-white">
        {view === 'HOME' && <HomeView setView={handleNavClick} setCurrentProduct={setCurrentProduct} setCurrentService={setCurrentService} />}
        {view === 'MALL' && <MallView />}
        {view === 'RECYCLE_FORM' && <RecycleFormView />}
        {view === 'INFO_HALL' && (
             <div className="py-12">
                 <PriceMonitoringSection />
             </div>
        )}
        {view === 'PRODUCT_DETAIL' && currentProduct && <ProductDetailView product={currentProduct} goBack={() => setView('HOME')} />}
        {/* If user clicks nav item without selecting specific service, we default to first one or a list. For simplicity, we use the first one if null */}
        {view === 'SERVICE_DETAIL' && (
             <ServiceDetailView service={currentService || SERVICE_ITEMS[0]} goBack={() => setView('HOME')} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-sm pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-gray-800 pb-8">
            <div>
                <h4 className="text-white font-bold text-lg mb-4">关于平台</h4>
                <ul className="space-y-2">
                    <li>民和简介</li>
                    <li>双城特色</li>
                    <li>合作社入驻</li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold text-lg mb-4">服务支持</h4>
                <ul className="space-y-2">
                    <li>农机调度</li>
                    <li>回收标准</li>
                    <li>价格指数</li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold text-lg mb-4">联系方式</h4>
                <ul className="space-y-2">
                    <li>电话：0451-53270777</li>
                    <li>地址：双城区转盘道现代农事综合服务中心</li>
                </ul>
            </div>
            <div className="text-center">
                 <div className="w-24 h-24 bg-white mx-auto mb-2 p-1">
                     <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=MinheSmartPlatform" alt="QR" />
                 </div>
                <p className="text-xs">扫描下载民和供销APP</p>
            </div>
        </div>
        <div className="text-center text-xs text-gray-600">
            <p>&copy; 2025 民和供销智慧平台 | 黑ICP备xxxxxx号</p>
        </div>
      </footer>
    </div>
  );
}
