-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 05, 2018 at 10:38 AM
-- Server version: 5.6.41-cll-lve
-- PHP Version: 5.6.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lyriacom_meobytes`
--

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `eventId` int(128) NOT NULL,
  `eventType` enum('photo','text','audio','link') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'photo',
  `FilePath` varchar(255) DEFAULT NULL,
  `Comments` varchar(1024) CHARACTER SET armscii8 COLLATE armscii8_bin DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`eventId`, `eventType`, `FilePath`, `Comments`) VALUES
(1, 'audio', 'Audio/space.mp3', 'Star Trek Theme Song.'),
(2, 'text', NULL, 'This is some text. How\'s it going JK?'),
(3, 'photo', 'Photo/wow.jpg', NULL),
(4, 'link', 'http://www.greenbushlabs.com/dest/?rec=1', 'at Observatory'),
(5, 'link', 'http://www.greenbushlabs.com/dest/?rec=2', 'at Science Center'),
(6, 'link', 'http://www.greenbushlabs.com/dest/?rec=3', 'at Haderlein'),
(7, 'link', 'http://www.greenbushlabs.com/dest/?rec=4', 'at Main Building'),
(8, 'link', 'http://www.greenbushlabs.com/dest/?rec=5', 'at Warehouse');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `positionId` int(128) NOT NULL,
  `latitude` decimal(10,6) NOT NULL,
  `longitude` decimal(10,6) NOT NULL,
  `altitude` int(25) DEFAULT NULL,
  `positionTimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `eventId` int(128) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`positionId`, `latitude`, `longitude`, `altitude`, `positionTimeStamp`, `eventId`) VALUES
(3, '37.513808', '-94.986628', 180, '2018-06-06 21:08:36', 5),
(1, '37.689505', '-97.158442', 155, '2014-08-16 14:33:49', 3),
(2, '37.512942', '-94.986057', 151, '2018-06-06 21:05:09', 4),
(6, '37.513033', '-94.987193', 180, '2018-06-06 21:13:21', 8),
(5, '37.513659', '-94.987311', 180, '2018-06-06 21:12:05', 7),
(4, '37.514158', '-94.987172', 180, '2018-06-06 21:10:48', 6),
(7, '37.400412', '-94.688006', 180, '2018-06-06 21:18:55', 2),
(8, '37.149101', '-94.546414', 179, '2018-06-08 03:05:32', 3);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` int(255) NOT NULL,
  `OAuth` varchar(1000) CHARACTER SET armscii8 NOT NULL,
  `FName` varchar(128) CHARACTER SET armscii8 NOT NULL,
  `LName` varchar(128) CHARACTER SET armscii8 NOT NULL,
  `Email` varchar(255) CHARACTER SET armscii8 NOT NULL,
  `Phone` varchar(128) CHARACTER SET armscii8 NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`eventId`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`positionId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `OAuth` (`OAuth`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `eventId` int(128) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `positionId` int(128) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
