"use client";

type Props<T> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyText?: string;
};

export default function MobileCardList<T>({
  data,
  renderItem,
  emptyText = "Tidak ada data",
}: Props<T>) {
  if (!data.length) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">{emptyText}</div>
    );
  }

  return (
    <div className="md:hidden space-y-3">
      {data.map((item, index) => renderItem(item, index))}
    </div>
  );
}
