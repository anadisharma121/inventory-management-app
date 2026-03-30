import Image from 'next/image';

export default function AcmeLogo() {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/Fast_Fleet_Logistics_Logo.svg"
        alt="Fast Fleet Logistics"
        width={918.9}
        height={318.1}
        className="h-auto w-full"
        priority
      />
    </div>
  );
}
