import org.apache.log4j.{Level, Logger}
import org.apache.spark.sql.{DataFrame, Dataset, Row, SaveMode, SparkSession}

import util.control.Breaks._
import scala.collection.mutable.ListBuffer
import scala.math._

object ManageTrajectory {

  Logger.getLogger("org.spark_project").setLevel(Level.WARN)
  Logger.getLogger("org.apache").setLevel(Level.WARN)
  Logger.getLogger("akka").setLevel(Level.WARN)
  Logger.getLogger("com").setLevel(Level.WARN)

  // Below is a class which corresponds to each entry in the Trajectory List
  case class SpTPoint(lat: Double, lon: Double, timestamp: Long)

  def loadTrajectoryData(spark: SparkSession, filePath: String, outputPath: String): Unit = {
    val dfJSON: Dataset[Row] = spark.read.format("json").option("multiLine", value = true).option("inferSchema", value = true).load(filePath)
    //val dfJSON = spark.read.option("multiline", "true").json(filePath)
    //dfJSON.printSchema()

    // Get list of rows from the JSON loaded.
    val trajectoryDfArray = dfJSON.collect()

    import spark.implicits._
    val processedData : ListBuffer[(ListBuffer[SpTPoint], Long, Long, Double, Double, Double, Double)] = new ListBuffer()

    for (rowIndex <- trajectoryDfArray.indices) {
      // Declare a new class object list
      val classObjList = new ListBuffer[SpTPoint]()

      val rowList = trajectoryDfArray(rowIndex).getSeq[Row](0)
      val trajectory_id = trajectoryDfArray(rowIndex).getLong(1)
      val vehicle_id = trajectoryDfArray(rowIndex).getLong(2)

      var maxLon = Double.MaxValue
      var minLon = Double.MinValue
      var maxLat = Double.MaxValue
      var minLat = Double.MinValue

      rowList.foreach(f => {
        val latitude: Double = f.getList(0).get(0)
        val longitude: Double = f.getList(0).get(1)
        val timestamp: Long = f.getLong(1)

        maxLon = max(maxLon, longitude)
        maxLat = max(maxLat, latitude)
        minLon = min(minLon, longitude)
        minLat = min(minLat, latitude)

        val curr = SpTPoint(lat = latitude, lon = longitude, timestamp = timestamp)
        classObjList += curr
      })

      // Sort the list based on the timestamp ordering.
      val sortedList = classObjList.sortBy(_.timestamp)
      processedData += Tuple7(sortedList, trajectory_id, vehicle_id, maxLon, minLon, maxLat, minLat)
    }

    // Convert the list to a DF with the following schema.
    val processedDF = processedData.toDF("trajectory", "trajectory_id", "vehicle_id", "maxLon", "minLon", "maxLat", "minLat")
    processedDF.coalesce(1).write.mode(SaveMode.Overwrite).json(outputPath)
    //return processedDF
  }

  // Function to check if two bounding boxes overlap
  def isBoundingBoxesOverlapping(d: Double, d1: Double, d2: Double, d3: Double, d4: Double, d5: Double, d6: Double, d7: Double): Boolean = {
    val widthIsPositive = Math.min(d2, d6) >= Math.max(d, d4)
    val heightIsPositive = Math.min(d3, d7) >= Math.max(d1, d5)
    widthIsPositive && heightIsPositive
  }

  def getSpatialRange(spark: SparkSession, latMin: Double, lonMin: Double, latMax: Double, lonMax: Double, outputPath: String, inputPath: String): Unit = {
    import spark.implicits._
    val spatialRangeData: ListBuffer[(Long, Long, List[Long], ListBuffer[List[Double]])] = new ListBuffer()

    val dfTrajectory = spark.read.format("json").option("multiLine", value = true).option("inferSchema", value = true).load(inputPath)

    val trajectoryDfArray = dfTrajectory.collect()
    for (i <- trajectoryDfArray.indices) {
      val timeStampList = new ListBuffer[Long]()
      val locationList: ListBuffer[List[Double]] = new ListBuffer()

      val spTPointList = trajectoryDfArray(i).getSeq[Row](4)
      val trajectory_id = trajectoryDfArray(i).getLong(5)
      val vehicle_id = trajectoryDfArray(i).getLong(6)
      val maxLon = trajectoryDfArray(i).getDouble(1)
      val minLon = trajectoryDfArray(i).getDouble(3)
      val maxLat = trajectoryDfArray(i).getDouble(0)
      val minLat = trajectoryDfArray(i).getDouble(2)

      val isOverlapping = isBoundingBoxesOverlapping(lonMin, latMin, lonMax, latMax, minLon, minLat, maxLon, maxLat)

      // Check if the given (lonMin, latMin, lonMax, lonMin) lies in the corresponding range of each row.
      if (isOverlapping) {
        var isTrajectoryInRange = false
        spTPointList.foreach(f => {
          val lat: Double = f.getDouble(0)
          val lon: Double = f.getDouble(1)
          val timeStamp: Long = f.getLong(2)
          if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax) {
            timeStampList += timeStamp
            locationList += List(lat, lon)
            isTrajectoryInRange = true
          }
        })
        if (isTrajectoryInRange)
          spatialRangeData += Tuple4(trajectory_id, vehicle_id, timeStampList.toList, locationList)
      }
    }

    // Sort the list in descending order based on trajectory_id.
    val sorted_data = spatialRangeData.sortBy(_._1)(Ordering[Long].reverse)

    // Convert the list to a DF with the following schema.
    val spatialRangeDF = sorted_data.toDF("trajectory_id", "vehicle_id", "timestamp", "location")
    spatialRangeDF.coalesce(1).write.mode(SaveMode.Overwrite).json(outputPath)
    //spatialRangeDF
  }


  def getSpatioTemporalRange(spark: SparkSession, timeMin: Long, timeMax: Long, latMin: Double, lonMin: Double, latMax: Double, lonMax: Double, outputPath: String, inputPath: String): Unit = {
    import spark.implicits._
    val spatialTemporalRangeData: ListBuffer[(Long, Long, List[Long], ListBuffer[List[Double]])] = new ListBuffer()

    val dfTrajectory = spark.read.format("json").option("multiLine", value = true).option("inferSchema", value = true).load(inputPath)
    
    val trajectoryDfArray = dfTrajectory.collect()
    for (i <- trajectoryDfArray.indices) {
      val timeStampList = new ListBuffer[Long]()
      val locationList: ListBuffer[List[Double]] = new ListBuffer()

      val spTPointList = trajectoryDfArray(i).getSeq[Row](4)
      val trajectory_id = trajectoryDfArray(i).getLong(5)
      val vehicle_id = trajectoryDfArray(i).getLong(6)
      val maxLon = trajectoryDfArray(i).getDouble(1)
      val minLon = trajectoryDfArray(i).getDouble(3)
      val maxLat = trajectoryDfArray(i).getDouble(0)
      val minLat = trajectoryDfArray(i).getDouble(2)

      val isOverlapping = isBoundingBoxesOverlapping(lonMin, latMin, lonMax, latMax, minLon, minLat, maxLon, maxLat)

      // Check if the given (lonMin, latMin, lonMax, lonMin, timeMin, timeMax) lies in the corresponding range of each row.
      if (isOverlapping && (min(timeMax, spTPointList.last.getLong(2)) >= max(timeMin, spTPointList.head.getLong(2)))) {
        var isTrajectoryInTemporalRange = false
        spTPointList.foreach(f => {
          val lat: Double = f.getDouble(0)
          val lon: Double = f.getDouble(1)
          val timeStamp: Long = f.getLong(2)
          if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax && timeStamp >= timeMin && timeStamp <= timeMax) {
            timeStampList += timeStamp
            locationList += List(lat, lon)
            isTrajectoryInTemporalRange = true
          }
        })
        if (isTrajectoryInTemporalRange)
          spatialTemporalRangeData += Tuple4(trajectory_id, vehicle_id, timeStampList.toList, locationList)
      }
    }

    // Sort the list in descending order based on trajectory_id.
    val sorted_data = spatialTemporalRangeData.sortBy(_._1)(Ordering[Long].reverse)

    // Convert the list to a DF with the following schema.
    val spatialTemporalRangeDF = sorted_data.toDF("trajectory_id", "vehicle_id", "timestamp", "location")
    spatialTemporalRangeDF.coalesce(1).write.mode(SaveMode.Overwrite).json(outputPath)
    //spatialTemporalRangeDF
  }

  // Function to calculate distance between two trajectories.
  def calculateDistance(rows1: Seq[Row], rows2: Seq[Row]): Double = {
    var minimumDistance = Double.MaxValue
    rows1.foreach(f1 => {
      rows2.foreach(f2 => {
        val x1: Double = f1.getDouble(0)
        val y1: Double = f1.getDouble(1)

        val x2: Double = f2.getDouble(0)
        val y2: Double = f2.getDouble(1)

        // Distance between two points (x1,y1) and (x2,y2) = sqrt((x2-x1)^2 + (y2-y1)^2)
        val pointDistance: Double = sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)))
        if (minimumDistance > pointDistance) {
          minimumDistance = pointDistance
        }
      })
    })
    minimumDistance
  }

  def getKNNTrajectory(spark: SparkSession, trajectoryId: Long, neighbors: Int, outputPath: String, inputPath: String): Unit = {
    val dfTrajectory = spark.read.format("json").option("multiLine", value = true).option("inferSchema", value = true).load(inputPath)
    val trajectoryDfArray = dfTrajectory.collect()

    import spark.implicits._
    val kNearestNeighborsList: ListBuffer[Long] = new ListBuffer[Long]()

    // Obtain the trajectory corresponding to the trajectoryId passed in the arguments.
    var refSpTPointList: Seq[Row] = Seq()
    for (i <- trajectoryDfArray.indices) {
      breakable {
        if (trajectoryId == trajectoryDfArray(i).getLong(5)) {
          refSpTPointList = trajectoryDfArray(i).getSeq[Row](4)
          break
        }
      }
    }

    // Populate the distance between the given trajectory and all remaining trajectories in a list.
    var neighborsList: ListBuffer[(Double, Long)] = new ListBuffer()
    for (i <- trajectoryDfArray.indices) {
      val currTrajectory_id = trajectoryDfArray(i).getLong(5)
      val currSpTPointList = trajectoryDfArray(i).getSeq[Row](4)
      if (trajectoryId != currTrajectory_id) {
        val distanceBwTrajectory = calculateDistance(currSpTPointList, refSpTPointList)
        neighborsList += Tuple2(distanceBwTrajectory, currTrajectory_id)
      }
    }

    // Sort the list in ascending order.
    neighborsList = neighborsList.sorted

    // Populate only "neighbors" number of elements into a list.
    for (i <- 0 until neighbors) {
      kNearestNeighborsList += neighborsList(i)._2
    }

    // Convert the list to a DF with the following schema.
    val resultDF = kNearestNeighborsList.toDF("trajectory_id")
    resultDF.coalesce(1).write.mode(SaveMode.Overwrite).json(outputPath)
    //resultDF
  }
}