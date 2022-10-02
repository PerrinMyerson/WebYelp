-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Aug 20, 2021 at 04:29 PM
-- Server version: 5.7.32
-- PHP Version: 7.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webnotes`
--

-- --------------------------------------------------------

--
-- Table structure for table `highlights`
--

CREATE TABLE `highlights` (
  `id` int(11) NOT NULL,
  `startOffset` int(11) NOT NULL,
  `startNode` varchar(480) NOT NULL,
  `urlid` int(11) NOT NULL,
  `date` date NOT NULL,
  `userid` int(11) NOT NULL,
  `startIsText` varchar(10) NOT NULL,
  `startTagName` varchar(40) NOT NULL,
  `startHTML` varchar(480) NOT NULL,
  `endNode` varchar(480) NOT NULL,
  `endOffset` int(11) NOT NULL,
  `endTagName` varchar(40) NOT NULL,
  `endIsText` varchar(10) NOT NULL,
  `endHTML` varchar(480) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `highlights`
--

INSERT INTO `highlights` (`id`, `startOffset`, `startNode`, `urlid`, `date`, `userid`, `startIsText`, `startTagName`, `startHTML`, `endNode`, `endOffset`, `endTagName`, `endIsText`, `endHTML`) VALUES
(7, 25, 'Testing, reproducible results, and well defined functional specifications are the life-blood of a well designed and well functioning API. Testing itself has several phases, beginning with creating unit tests to verify operation of individual code components, through to integration testing where you start plugging pieces of your API ecosystem together.', 45, '2021-08-04', 1, 'true', 'P', 'Testing, reproducible results, and well defined functional specifications are the life-blood of a well designed and well functioning API. Testing itself has several phases, beginning with creating unit tests to verify operation of individual code components, through to integration testing where you start plugging pieces of your API ecosystem together.', 'Testing, reproducible results, and well defined functional specifications are the life-blood of a well designed and well functioning API. Testing itself has several phases, beginning with creating unit tests to verify operation of individual code components, through to integration testing where you start plugging pieces of your API ecosystem together.', 109, 'P', 'true', 'Testing, reproducible results, and well defined functional specifications are the life-blood of a well designed and well functioning API. Testing itself has several phases, beginning with creating unit tests to verify operation of individual code components, through to integration testing where you start plugging pieces of your API ecosystem together.'),
(8, 156, 'ed and well functioning API. Testing itself has several phases, beginning with creating unit tests to verify operation of individual code components, through to integration testing where you start plugging pieces of your API ecosystem together.', 45, '2021-08-04', 1, 'true', 'P', 'Testing, reproducible res<span class=\"wn_\" style=\"background-color:#ff0000\">ults, and well defined functional specifications are the life-blood of a well design</span>ed and well functioning API. Testing itself has several phases, beginning with creating unit tests to verify operation of individual code components, through to integration testing where you start plugging pieces of your API ecosystem together.', 'ed and well functioning API. Testing itself has several phases, beginning with creating unit tests to verify operation of individual code components, through to integration testing where you start plugging pieces of your API ecosystem together.', 163, 'P', 'true', 'Testing, reproducible res<span class=\"wn_\" style=\"background-color:#ff0000\">ults, and well defined functional specifications are the life-blood of a well design</span>ed and well functioning API. Testing itself has several phases, beginning with creating unit tests to verify operation of individual code components, through to integration testing where you start plugging pieces of your API ecosystem together.');

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` int(11) NOT NULL,
  `highlightid` int(11) NOT NULL,
  `note` varchar(256) NOT NULL,
  `userid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `urls`
--

CREATE TABLE `urls` (
  `id` int(11) NOT NULL,
  `url` varchar(240) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `urls`
--

INSERT INTO `urls` (`id`, `url`) VALUES
(44, 'https://rebrickable.com/'),
(45, 'https://medium.com/server-side-swift-and-more/api-endpoint-testing-with-postman-63f907217f15');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`) VALUES
(1, 'nmyerson@gmail.com'),
(2, 'perrinmyerson@gmail.com');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `highlights`
--
ALTER TABLE `highlights`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `urls`
--
ALTER TABLE `urls`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `highlights`
--
ALTER TABLE `highlights`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `urls`
--
ALTER TABLE `urls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
