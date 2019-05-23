/******************************************************************************
    Simple Player:  this file is part of QtAV examples
    Copyright (C) 2012-2016 Wang Bin <wbsecg1@gmail.com>

*   This file is part of QtAV

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/

#ifndef MAINRWINDOW_H
#define MAINRWINDOW_H

#include <QCompleter>
#include <QDialog>
#include <QDialogButtonBox>
#include <QLabel>
#include <QLineEdit>
#include <QWidget>
#include <QtAV>
#include <QTextEdit>
#include <QStringListModel>

#if (_FILE_TYPE_ == 1)
  #include "customplaintextedit.h"
#endif


QT_BEGIN_NAMESPACE
class QSlider;
class QPushButton;
QT_END_NAMESPACE


class TagDialog : public QDialog{
    Q_OBJECT
  public:
    explicit TagDialog(QString title,  QString str,  QWidget* parent = 0);
    QLineEdit* nameEdit;
  private:
    QDialogButtonBox* buttonBox;
};


class MainWindow : public QWidget
{
    Q_OBJECT
public:
    explicit MainWindow(int argc,  char** argv,  QWidget *parent = 0);
    QString media_tag(QString str);
    void media_tag_new_preset(int n);
    void media_overwrite();
    void media_next();
    void media_open();
    void media_replace_w_link(const char* src);
    void media_delete();
    void media_linkfrom();
    void media_score();
    void media_note();
    uint64_t get_id_from_table(const char* table_name, const char* entry_name);
    uint64_t file_attr_id(const char* attr, uint64_t attr_id_int, const char* file_id_str, const int file_id_str_len);
    double volume;
    QString tag_preset[10];
  #if (_FILE_TYPE_ == 0)
    QtAV::VideoOutput* m_vo;
    QtAV::AVPlayer* m_player;
  #elif (_FILE_TYPE_ == 1)
    CustomPlainTextEdit* plainTextEdit;
    void media_save();
    void set_read_only();
    void unset_read_only();
    bool is_file_modified;
    bool is_read_only;
  #endif
public Q_SLOTS:
  #if (_FILE_TYPE_ == 0)
    void seekBySlider(int value);
    void seekBySlider();
    void playPause();
  #endif
private Q_SLOTS:
  #if (_FILE_TYPE_ == 0)
    void updateSlider(qint64 value);
    void updateSlider();
    void updateSliderUnit();
    void set_player_options_for_img();
  #elif (_FILE_TYPE_ == 1)
    void file_modified();
  #endif
private:
  #if (_FILE_TYPE_ == 0)
    QSlider *m_slider;
    int m_unit;
  #endif
    bool ignore_tagged;
    char media_fp[4096];
    char media_dir[4096 - 1024];
    char media_fname[1024];
    int media_dir_len;
    int file_id_str_len;
    char file_id_str[16]; // Cache database ID of file. NOT an integer, but rather the string that is inserted into SQL query statements.
    uint64_t file_id;
    FILE* inf;
    
    QStringList tagslist;
    QCompleter* tagcompleter;
    
    void ensure_fileID_set();
    void set_table_attr_by_id(const char* tbl, const char* id, const int id_len, const char* col, const char* val);
    void tag2parent(uint64_t tag_id,  uint64_t parent_id);
    uint64_t add_new_tag(QString tagstr,  uint64_t tagid = 0);
};

class keyReceiver : public QObject
// src: https://wiki.qt.io/How_to_catch_enter_key
{
    Q_OBJECT
public:
    MainWindow* window;
    int state;
    enum { state_default, state_clicked };
protected:
    bool eventFilter(QObject* obj, QEvent* event);
};

#endif // MAINRWINDOW_H