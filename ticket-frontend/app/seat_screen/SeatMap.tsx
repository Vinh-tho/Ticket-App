import React, { useRef, useState } from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import Svg, { Rect, Text as SvgText, Circle, Path, G, Defs, LinearGradient, Stop } from "react-native-svg";

interface SeatBlock {
  color: string;
  rows: Array<{
    label: string;
    seats: number;
  }>;
}

interface SelectedSeat {
  blockIdx: number;
  rowIdx: number;
  seatIdx: number;
}

interface SeatMapProps {
  seatBlocks: SeatBlock[];
  selectedSeats: SelectedSeat[];
  handleSeatPress: (blockIdx: number, rowIdx: number, seatIdx: number) => void;
  SVG_WIDTH: number;
  seatRadius: number;
  seatGap: number;
  seatDiameter: number;
  blockPadding: number;
  blockVerticalPadding: number;
  rowGap: number;
  seats: any[];
  soldSeats?: string[];
}

interface SeatPosition {
  blockIdx: number;
  rowIdx: number;
  seatIdx: number;
  cx: number;
  cy: number;
}

export default function SeatMap({
  seatBlocks,
  selectedSeats,
  handleSeatPress,
  SVG_WIDTH,
  seatRadius,
  seatGap,
  seatDiameter,
  blockPadding,
  blockVerticalPadding,
  rowGap,
  seats,
  soldSeats = [],
}: SeatMapProps) {
  let totalHeight = 140;
  seatBlocks.forEach((block) => {
    const blockHeight =
      blockVerticalPadding * 2 +
      block.rows.length * seatDiameter +
      (block.rows.length - 1) * rowGap;
    totalHeight += blockHeight + 10;
  });

  // Tạo mảng lưu vị trí tất cả ghế
  const seatPositions: SeatPosition[] = [];
  seatBlocks.forEach((block, blockIdx) => {
    const maxSeats = Math.max(...block.rows.map((r) => Array.isArray(r.seats) ? r.seats.length : 0));
    const blockWidth = blockPadding * 2 + (maxSeats - 1) * seatGap + seatDiameter;
    const blockX = (SVG_WIDTH - blockWidth) / 2;
    let y = 140;
    for (let i = 0; i < blockIdx; i++) {
      const prevBlock = seatBlocks[i];
      const prevBlockHeight = blockVerticalPadding * 2 + prevBlock.rows.length * seatDiameter + (prevBlock.rows.length - 1) * rowGap;
      y += prevBlockHeight + 10;
    }
    block.rows.forEach((row, rowIdx) => {
      if (Array.isArray(row.seats)) {
        row.seats.forEach((seat: any, seatIdx: number) => {
          const cx = blockX + blockPadding + seatIdx * seatGap;
          const cy = y + blockVerticalPadding + rowIdx * (seatDiameter + rowGap) + seatRadius;
          seatPositions.push({ blockIdx, rowIdx, seatIdx, cx, cy });
        });
      }
    });
  });

  // Hàm kiểm tra xem ghế có bị khóa không
  const isSeatLocked = (blockIdx: number, rowIdx: number, seatIdx: number) => {
    const block = seatBlocks[blockIdx];
    if (!block) return false;
    const row = block.rows[rowIdx];
    if (!row || !Array.isArray(row.seats)) return false;
    const seat = row.seats[seatIdx];
    if (!seat) return false;

    // Kiểm tra nếu ghế đã bán hoặc có trong danh sách ghế đã bán
    return seat.status === "SOLD" || soldSeats.includes(seat.id?.toString());
  };

  // Hàm xử lý khi tap vào overlay Pressable
  const handleOverlayPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const svgX = locationX;
    const svgY = locationY;
    let minDist = Infinity;
    let nearestSeat: SeatPosition | null = null;
    seatPositions.forEach(pos => {
      const dist = Math.sqrt((svgX - pos.cx) ** 2 + (svgY - pos.cy) ** 2);
      if (dist < minDist) {
        minDist = dist;
        nearestSeat = pos;
      }
    });
    if (nearestSeat && minDist <= seatRadius + 20) {
      // Kiểm tra xem ghế có bị khóa không trước khi cho phép chọn
      const seatPos = nearestSeat as SeatPosition;
      if (!isSeatLocked(seatPos.blockIdx, seatPos.rowIdx, seatPos.seatIdx)) {
        handleSeatPress(seatPos.blockIdx, seatPos.rowIdx, seatPos.seatIdx);
      }
    }
  };

  // Hàm lấy màu cho ghế
  const getSeatColor = (blockIdx: number, rowIdx: number, seatIdx: number) => {
    if (isSeatLocked(blockIdx, rowIdx, seatIdx)) {
      return '#666'; // Ghế đã bán
    }
    const isSelected = selectedSeats.some(
      s => s.blockIdx === blockIdx && s.rowIdx === rowIdx && s.seatIdx === seatIdx
    );
    if (isSelected) return '#00FF99'; // Ghế đã chọn
    return '#fff'; // Ghế trống
  };

  return (
    <View style={styles.container}>
      <View style={{ width: SVG_WIDTH, height: totalHeight }}>
        <Svg width={SVG_WIDTH} height={totalHeight}>
          <Defs>
            {/* Stage Light Gradient */}
            <LinearGradient id="stageLight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFD700" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#FFD700" stopOpacity="0" />
            </LinearGradient>
            
            {/* Stage Floor Gradient */}
            <LinearGradient id="stageFloor" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#2C2C2C" />
              <Stop offset="1" stopColor="#1a1a1a" />
            </LinearGradient>
          </Defs>

          {/* Stage Base with Gradient */}
          <Rect x={40} y={20} width={300} height={80} rx={16} fill="url(#stageFloor)" />
          
          {/* Multi-layered Stage Curtains */}
          <Path
            d="M40 20 Q190 -10 340 20"
            stroke="#8B0000"
            strokeWidth="6"
            fill="none"
            opacity="0.8"
          />
          <Path
            d="M40 20 Q190 10 340 20"
            stroke="#8B0000"
            strokeWidth="4"
            fill="none"
            opacity="0.6"
          />
          <Path
            d="M40 20 Q190 30 340 20"
            stroke="#8B0000"
            strokeWidth="3"
            fill="none"
            opacity="0.4"
          />
          
          {/* Enhanced Stage Lights */}
          <G>
            {/* Main Stage Lights */}
            <Circle cx={80} cy={15} r={10} fill="#FFD700" opacity="0.9" />
            <Circle cx={160} cy={15} r={10} fill="#FFD700" opacity="0.9" />
            <Circle cx={240} cy={15} r={10} fill="#FFD700" opacity="0.9" />
            <Circle cx={320} cy={15} r={10} fill="#FFD700" opacity="0.9" />
            
            {/* Light Beams */}
            <Path
              d="M80 25 L80 80"
              stroke="url(#stageLight)"
              strokeWidth="4"
              opacity="0.3"
            />
            <Path
              d="M160 25 L160 80"
              stroke="url(#stageLight)"
              strokeWidth="4"
              opacity="0.3"
            />
            <Path
              d="M240 25 L240 80"
              stroke="url(#stageLight)"
              strokeWidth="4"
              opacity="0.3"
            />
            <Path
              d="M320 25 L320 80"
              stroke="url(#stageLight)"
              strokeWidth="4"
              opacity="0.3"
            />
          </G>
          
          {/* Enhanced Stage Logo/Backdrop */}
          <Rect x={120} y={35} width={140} height={50} rx={8} fill="#1a1a1a" />
          <Rect x={125} y={40} width={130} height={40} rx={6} fill="#2C2C2C" />
          <SvgText
            x={190}
            y={65}
            fill="#FFD700"
            fontWeight="bold"
            fontSize="18"
            textAnchor="middle"
          >
            STAGE
          </SvgText>

          {/* Decorative Stage Elements */}
          <Path
            d="M40 20 L40 100 M340 20 L340 100"
            stroke="#FFD700"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          
          {/* Stage Edge Highlights */}
          <Path
            d="M40 20 L340 20"
            stroke="#FFD700"
            strokeWidth="1"
            opacity="0.4"
          />
          <Path
            d="M40 100 L340 100"
            stroke="#FFD700"
            strokeWidth="1"
            opacity="0.4"
          />
          
          {/* Rest of the seat blocks */}
          {(() => {
            let currentY = 140;
            return seatBlocks.map((block, blockIdx) => {
              const maxSeats = Math.max(...block.rows.map((r) => Array.isArray(r.seats) ? r.seats.length : 0));
              const blockWidth =
                blockPadding * 2 + (maxSeats - 1) * seatGap + seatDiameter;
              const blockX = (SVG_WIDTH - blockWidth) / 2;
              const blockHeight =
                blockVerticalPadding * 2 +
                block.rows.length * seatDiameter +
                (block.rows.length - 1) * rowGap;
              const y = currentY;
              currentY += blockHeight + 10;
              return (
                <React.Fragment key={blockIdx}>
                  <Rect
                    x={blockX}
                    y={y}
                    width={blockWidth}
                    height={blockHeight}
                    rx={18}
                    fill={block.color}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                  {block.rows.map((row, rowIdx) =>
                    Array.isArray(row.seats)
                      ? row.seats.map((seat: any, seatIdx: number) => {
                          const cx = blockX + blockPadding + seatIdx * seatGap;
                          const cy =
                            y +
                            blockVerticalPadding +
                            rowIdx * (seatDiameter + rowGap) +
                            seatRadius;
                          const isSelected = selectedSeats.some(
                            seat =>
                              seat.blockIdx === blockIdx &&
                              seat.rowIdx === rowIdx &&
                              seat.seatIdx === seatIdx
                          );
                          let fillColor = "#fff";
                          if (seat.status === "SOLD") {
                            fillColor = "#666";
                          } else if (seat.status === "HELD") {
                            fillColor = "#FFD966";
                          } else if (isSelected) {
                            fillColor = "#00FF99";
                          }
                          return (
                            <Circle
                              key={seatIdx}
                              cx={cx}
                              cy={cy}
                              r={seatRadius}
                              fill={getSeatColor(blockIdx, rowIdx, seatIdx)}
                              opacity={isSeatLocked(blockIdx, rowIdx, seatIdx) ? 0.5 : 1}
                              stroke="#BDBDBD"
                              strokeWidth={1}
                            />
                          );
                        })
                      : null
                  )}
                  {block.rows.map((row, rowIdx) => (
                    <SvgText
                      key={rowIdx}
                      x={blockX + 5}
                      y={
                        y +
                        blockVerticalPadding +
                        rowIdx * (seatDiameter + rowGap) +
                        seatRadius +
                        4
                      }
                      fill="#fff"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {row.label}
                    </SvgText>
                  ))}
                  {block.rows.map((row, rowIdx) => (
                    <SvgText
                      key={rowIdx + "r"}
                      x={blockX + blockWidth - 10}
                      y={
                        y +
                        blockVerticalPadding +
                        rowIdx * (seatDiameter + rowGap) +
                        seatRadius +
                        4
                      }
                      fill="#fff"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      {row.label}
                    </SvgText>
                  ))}
                </React.Fragment>
              );
            });
          })()}
        </Svg>
        <Pressable
          style={StyleSheet.absoluteFill}
          pointerEvents="box-only"
          onPress={handleOverlayPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    overflow: 'hidden',
  },
});
