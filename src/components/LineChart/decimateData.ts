/**
 * AI generated code
 *
 * Largest-Triangle-Three-Buckets (LTTB) algorithm for downsampling time series data.
 * This algorithm preserves the visual shape of the data while reducing the number of points.
 *
 */

interface DataPoint {
  x: string;
  y: number;
}

/**
 * Decimates data using the LTTB algorithm to reduce the number of points
 * while preserving the visual appearance of the chart.
 *
 * @param data - The original data array
 * @param targetPoints - The desired number of points in the output
 * @returns Decimated data array
 */
export const decimateData = (
  data: DataPoint[],
  targetPoints: number
): DataPoint[] => {
  // If data is already small enough, return as-is
  if (data.length <= targetPoints) {
    return data;
  }

  // Always keep the first and last points
  const decimated: DataPoint[] = [data[0]];

  // Number of buckets for middle points (excluding first and last)
  const middlePointsCount = targetPoints - 2;
  // Size of each bucket (how many source points per bucket)
  const bucketSize = (data.length - 2) / middlePointsCount;

  let previousIndex = 0;

  for (let bucketIndex = 0; bucketIndex < middlePointsCount; bucketIndex++) {
    // Calculate the range for the current bucket (indices 1 to data.length-2)
    const rangeStart = Math.floor(bucketIndex * bucketSize) + 1;
    const rangeEnd = Math.floor((bucketIndex + 1) * bucketSize) + 1;

    // Calculate the average point of the next bucket (for triangle calculation)
    // For the last bucket, use the last point as the "next" reference
    let avgX: number;
    let avgY: number;

    if (bucketIndex === middlePointsCount - 1) {
      // Last bucket - use the last data point as reference
      avgX = new Date(data[data.length - 1].x).getTime();
      avgY = data[data.length - 1].y;
    } else {
      // Calculate average of the next bucket
      const nextRangeStart = rangeEnd;
      const nextRangeEnd = Math.floor((bucketIndex + 2) * bucketSize) + 1;

      avgX = 0;
      avgY = 0;
      let avgCount = 0;

      for (
        let j = nextRangeStart;
        j < nextRangeEnd && j < data.length - 1;
        j++
      ) {
        avgX += new Date(data[j].x).getTime();
        avgY += data[j].y;
        avgCount++;
      }

      if (avgCount > 0) {
        avgX /= avgCount;
        avgY /= avgCount;
      } else {
        // Fallback to last point
        avgX = new Date(data[data.length - 1].x).getTime();
        avgY = data[data.length - 1].y;
      }
    }

    // Find the point in the current bucket with the largest triangle area
    const previousPoint = data[previousIndex];
    const previousX = new Date(previousPoint.x).getTime();
    const previousY = previousPoint.y;

    let maxArea = -1;
    let maxAreaIndex = rangeStart;

    // Ensure we don't go past data.length - 1 (exclude the last point)
    const effectiveRangeEnd = Math.min(rangeEnd, data.length - 1);

    for (let j = rangeStart; j < effectiveRangeEnd; j++) {
      const currentX = new Date(data[j].x).getTime();
      const currentY = data[j].y;

      // Calculate triangle area using cross product
      const area = Math.abs(
        (previousX - avgX) * (currentY - previousY) -
          (previousX - currentX) * (avgY - previousY)
      );

      if (area > maxArea) {
        maxArea = area;
        maxAreaIndex = j;
      }
    }

    decimated.push(data[maxAreaIndex]);
    previousIndex = maxAreaIndex;
  }

  // Always add the last point
  decimated.push(data[data.length - 1]);

  return decimated;
};

/**
 * Default threshold for when to apply decimation.
 * Charts perform well up to ~500 points, so we target that.
 */
export const DECIMATION_THRESHOLD = 500;
