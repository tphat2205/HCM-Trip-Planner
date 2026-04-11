import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, Search, Filter, Map, CloudSun, Wallet, Layers, ArrowRight, BarChart3, MapPin, Globe } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const pipelineSteps = [
    {
      step: '1',
      title: 'Nhập truy vấn',
      desc: 'Người dùng nhập yêu cầu bằng ngôn ngữ tự nhiên tiếng Việt, kèm bộ lọc quận và ngân sách.',
    },
    {
      step: '2',
      title: 'Trích xuất ứng viên',
      desc: 'TF-IDF vector hóa truy vấn và tính cosine similarity với 500+ hồ sơ địa điểm.',
    },
    {
      step: '3',
      title: 'Xếp hạng',
      desc: 'XGBoost Ranker chấm điểm phù hợp dựa trên giá, đánh giá, danh mục và độ tương đồng.',
    },
    {
      step: '4',
      title: 'Kết quả',
      desc: 'Gợi ý 1 khách sạn, 2 quán ăn, 3 điểm tham quan — ưu tiên cùng khu vực để thuận tiện di chuyển.',
    },
  ];

  const features = [
    {
      icon: Search,
      title: 'Tìm kiếm tự nhiên',
      desc: 'Nhập yêu cầu bằng tiếng Việt như đang trò chuyện, hệ thống hiểu ngữ cảnh và gợi ý phù hợp.',
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Filter,
      title: 'Lọc thông minh',
      desc: 'Lọc theo quận/huyện và ngân sách. Tự động nới lỏng tiêu chí nếu không đủ kết quả.',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      icon: Map,
      title: 'Bản đồ tương tác',
      desc: 'Xem vị trí các địa điểm trên bản đồ, hiển thị lộ trình và tự động zoom phù hợp.',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
    {
      icon: CloudSun,
      title: 'Thời tiết',
      desc: 'Cập nhật thời tiết thời gian thực, cảnh báo khi điều kiện không phù hợp cho hoạt động ngoài trời.',
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    },
    {
      icon: Wallet,
      title: 'Ước tính chi phí',
      desc: 'Tổng hợp ngân sách dự kiến cho khách sạn, ăn uống và tham quan với biểu đồ trực quan.',
      color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    },
    {
      icon: Layers,
      title: 'Dark / Light Mode',
      desc: 'Giao diện tự động theo thiết lập hệ thống hoặc chuyển đổi thủ công theo sở thích.',
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    },
  ];

  const techStack = [
    { category: 'Frontend', items: ['React 19', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Leaflet', 'Recharts'] },
    { category: 'Backend', items: ['FastAPI', 'Python 3.12', 'Pandas', 'Scikit-learn', 'XGBoost'] },
    { category: 'Triển khai', items: ['Vercel', 'Render', 'Docker'] },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[5000] bg-gray-50 dark:bg-gray-900 overflow-y-auto no-scrollbar"
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Nút Đóng */}
        <button
          onClick={onClose}
          className="fixed top-6 right-6 z-50 p-3 bg-white dark:bg-gray-800 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full shadow-xl transition-all"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 space-y-20 text-gray-800 dark:text-gray-200">
          
          {/* Hero */}
          <motion.section 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-block p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-4">
              <Plane className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Vietnam Travel Planner
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Hệ thống tư vấn du lịch TP. Hồ Chí Minh — giúp du khách tìm kiếm khách sạn, quán ăn
              và điểm tham quan phù hợp nhất thông qua xử lý ngôn ngữ tự nhiên tiếng Việt.
            </p>
          </motion.section>

          {/* Quy trình hoạt động */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Quy trình hoạt động</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pipelineSteps.map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.08 }}
                >
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  
                  {/* Arrow connector (không hiển thị ở bước cuối) */}
                  {index < pipelineSteps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="h-5 w-5 text-emerald-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Tính năng */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Tính năng chính</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + index * 0.06 }}
                >
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${feature.color}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Tech Stack */}
          <motion.section
            className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 p-8 sm:p-12 rounded-3xl border border-emerald-100 dark:border-emerald-900/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Công nghệ sử dụng</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {techStack.map((group) => (
                <div key={group.category} className="text-center">
                  <h4 className="font-bold text-lg mb-4 text-emerald-700 dark:text-emerald-400">{group.category}</h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {group.items.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-sm font-medium shadow-sm border border-gray-200 dark:border-gray-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Phạm vi dữ liệu */}
          <motion.section
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-400 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              Phạm vi dữ liệu
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
              Hiện tại hệ thống tập trung vào khu vực <strong className="text-gray-800 dark:text-gray-200">TP. Hồ Chí Minh</strong> với 
              hơn 500 địa điểm bao gồm khách sạn, nhà hàng, quán ăn, điểm tham quan,
              spa và nhiều loại hình dịch vụ du lịch khác.
            </p>
          </motion.section>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}