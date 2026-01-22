import { useEffect, useState } from 'react';
import Image from 'next/image';

interface RecordItem {
    timestamp: string;
    productId: string;
    hasEnv: boolean;
    imageSizeKB?: number;
    copyTexts?: { styleA: string; styleB: string; styleC: string };
}

export default function RecordsPage() {
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/records')
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setRecords(data.records);
                } else {
                    console.error('Failed to fetch records');
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-4">加载中...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">生成记录</h1>
            {records.length === 0 ? (
                <p>暂无记录。</p>
            ) : (
                <table className="min-w-full table-auto border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2">时间</th>
                            <th className="px-4 py-2">产品ID</th>
                            <th className="px-4 py-2">是否上传环境图</th>
                            <th className="px-4 py-2">图片大小 (KB)</th>
                            <th className="px-4 py-2">文案预览</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((r, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border px-4 py-2 text-sm">{new Date(r.timestamp).toLocaleString()}</td>
                                <td className="border px-4 py-2 text-sm">{r.productId}</td>
                                <td className="border px-4 py-2 text-center text-sm">{r.hasEnv ? '是' : '否'}</td>
                                <td className="border px-4 py-2 text-sm">{r.imageSizeKB ?? '-'} </td>
                                <td className="border px-4 py-2 text-sm max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                    {r.copyTexts ? r.copyTexts.styleA.slice(0, 30) + '...' : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
