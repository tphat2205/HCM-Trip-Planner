import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, BrainCircuit, Code2, Cloud, ShieldCheck } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

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

        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 space-y-24 text-gray-800 dark:text-gray-200">
          
          {/* Section 1: Hero */}
          <motion.section 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-block p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mb-4">
              <BrainCircuit className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Hệ Thống Gợi Ý Du Lịch Việt Nam
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Dự án áp dụng các thuật toán Machine Learning tiên tiến để cá nhân hóa trải nghiệm tìm kiếm địa điểm, quán ăn và khách sạn cho khách du lịch.
            </p>
          </motion.section>

          {/* Section 2: Core Technologies */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">Lõi AI & Machine Learning</h3>
              </div>
              <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Content-Based Filtering (CBF):</strong> Trích xuất đặc trưng của địa điểm dựa trên từ khóa, thể loại và đánh giá để tính toán độ tương đồng.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>XGBoost:</strong> Mô hình gradient boosting tối ưu hóa việc xếp hạng (ranking) kết quả tìm kiếm dựa trên lịch sử tương tác.</span>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">Frontend & UI/UX</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Giao diện được xây dựng hướng tới hiệu năng cao và trải nghiệm người dùng mượt mà:
              </p>
              <div className="flex flex-wrap gap-2">
                {['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Leaflet Maps'].map(tech => (
                  <span key={tech} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Section 3: Architecture & Infra */}
          <motion.section 
            className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 p-8 sm:p-12 rounded-3xl border border-emerald-100 dark:border-emerald-900/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Kiến trúc Hệ thống & Hạ tầng</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-center text-emerald-500">
                  <Server className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-lg">Backend API</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Thiết kế RESTful API mạnh mẽ, quản lý luồng dữ liệu lớn và xử lý I/O bất đồng bộ.</p>
              </div>
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-lg">Database Security</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Áp dụng các chuẩn bảo mật cơ sở dữ liệu, phân quyền chặt chẽ và chống injection.</p>
              </div>
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-center text-emerald-500">
                  <Cloud className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-lg">DevOps & Cloud</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Triển khai hệ thống linh hoạt trên nền tảng Cloud, thiết lập luồng tự động hóa CI/CD.</p>
              </div>
            </div>
          </motion.section>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}