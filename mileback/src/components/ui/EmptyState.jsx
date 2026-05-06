export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 bg-surface-800 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={24} className="text-surface-400" />
        </div>
      )}
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-surface-400 text-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}
