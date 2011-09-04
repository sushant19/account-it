using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Globalization;
using System.Xml.Linq;
using System.IO;

namespace Banking.Backup
{
    public class Backuper
    {
        /// <summary>
        /// Creates Backuper with Path as working directory
        /// </summary>
        /// <param name="path">Directory for backup files</param>
        public Backuper(string path)
        {
            Path = path;
        }

        private static DateTimeFormatInfo TimeFormat = new DateTimeFormatInfo()
        {
            FullDateTimePattern = "yyyy/MM/dd_HH/mm/ss",
            DateSeparator = "-",
            TimeSeparator = "-"
        };

        public string Path { get; private set; }

        /// <summary>
        /// Saves current snapshot as an xml document to file
        /// </summary>
        /// <param name="snapshot">Data to backup</param>
        public void Save(Snapshot snapshot)
        {
            XDocument backup = Serializer.ToXml(snapshot);
            backup.Save(GetPath(snapshot.Time));
        }

        /// <summary>
        /// Saves current snapshot as an xml document to stream
        /// </summary>
        /// <param name="snapshot">Data to backup</param>
        /// <param name="stream">Stream for saving data</param>
        public void SaveTo(Snapshot snapshot, Stream stream)
        {
            XDocument backup = Serializer.ToXml(snapshot);
            backup.Save(stream);
        }
        /// <summary>
        /// Checks if backup file for specified time exists
        /// </summary>
        /// <param name="time"></param>
        /// <returns></returns>
        public bool Exists(DateTime time)
        {
            string path = GetPath(time);
            return File.Exists(path);
        }

        public bool NotExists(DateTime time)
        {
            return !Exists(time);
        }

        /// <summary>
        /// Loads snapshot for specified time from file
        /// </summary>
        /// <param name="time">Time backup was made</param>
        /// <returns></returns>
        public Snapshot Load(DateTime time)
        {
            string path = GetPath(time);
            XDocument snapshot = XDocument.Load(path);
            return Serializer.FromXml(snapshot);
        }
        /// <summary>
        /// Loads snapshot for specified time from file to given stream as an xml document
        /// </summary>
        /// <param name="time"></param>
        /// <param name="stream"></param>
        public void LoadTo(DateTime time, Stream stream)
        {
            string path = GetPath(time);
            XDocument snapshot = XDocument.Load(path);
            snapshot.Save(stream);
        }
        
        

        public void Rename(DateTime time, string mark)
        {
            Snapshot snapshot = Load(time);
            snapshot.Mark = mark;
            XDocument doc = Serializer.ToXml(snapshot);
            string path = GetPath(time);
            doc.Save(path);
        }

        /// <summary>
        /// Removes file of backup that was made at given time
        /// </summary>
        /// <param name="time">Time backup was made</param>
        public void Delete(DateTime time)
        {
            string path = GetPath(time);
            File.Delete(path);
        }
        /// <summary>
        /// Gets information about backup that was made at given time
        /// </summary>
        /// <param name="time"></param>
        /// <returns>SnapshotInfo for single backup</returns>
        public SnapshotInfo GetInfo(DateTime time)
        {
            string path = GetPath(time);
            XDocument doc = XDocument.Load(path);
            return Serializer.ParseInfo(doc);
        }

        /// <summary>
        /// Gets information about all existing backups
        /// </summary>
        /// <returns> List of SnapshotInfo</returns>
        public List<SnapshotInfo> GetAllInfo()
        {
            DirectoryInfo info = new DirectoryInfo(Path);
            info.Refresh();
            string[] files = info.GetFiles("*.xml")
                .Select(inf => inf.FullName).ToArray();
            var result = new List<SnapshotInfo>();
            foreach (string path in files)
            {
                XDocument doc = XDocument.Load(path);
                SnapshotInfo snapshot = Serializer.ParseInfo(doc);
                result.Add(snapshot);
            }
            return result;
        }
        
        // time => path to backup xml file
        private string GetPath(DateTime time)
        {
            string fileName = String.Format("{0}.xml",
                time.ToString("F", TimeFormat));
            return System.IO.Path.Combine(Path, fileName);
        }
    }
}
