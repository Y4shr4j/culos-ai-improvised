interface TokenCardProps {
  price: string;
  tokens: number;
  image: string;
  onClick?: () => void;
}

export default function TokenCard({
  price,
  tokens,
  image,
  onClick,
}: TokenCardProps) {
  return (
    <div
      className="w-[259px] px-[30px] py-4 flex flex-col justify-center items-center gap-[10px] rounded-[20px] border border-gray-500/20 bg-gradient-to-b from-culosai-token-card-from to-culosai-token-card-to shadow-[0px_6px_12px_0px_rgba(0,0,0,0.25)] cursor-pointer hover:scale-[1.02] transition-transform"
      onClick={onClick}
    >
      {/* Price */}
      <div className="w-full text-right">
        <span className="text-culosai-price-text font-norwester text-xl font-normal">
          {price}
        </span>
      </div>

      {/* Image and Token Info */}
      <div className="flex flex-col items-center gap-2">
        <img
          src={image}
          alt="Milk Bottle"
          className="w-[100px] h-[100px] object-cover"
        />

        <div className="w-[72px] flex flex-col items-center">
          <span className="text-culosai-create-btn-text font-norwester text-[40px] font-normal text-center">
            {tokens}
          </span>
          <span className="text-culosai-create-btn-text font-norwester text-2xl font-normal text-center">
            tokens
          </span>
        </div>
      </div>
    </div>
  );
}
