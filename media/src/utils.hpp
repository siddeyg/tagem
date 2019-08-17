#ifndef __COMPSKY_TAGEM_UTILS__
#define __COMPSKY_TAGEM_UTILS__

#include <inttypes.h>

#include <compsky/mysql/query.hpp>


extern MYSQL_RES* RES1;
extern MYSQL_ROW ROW1;


namespace _mysql {
	extern MYSQL* obj;
}

extern MYSQL_RES* RES1;
extern char BUF[];


inline
uint64_t get_last_insert_id(){
    uint64_t n = 0;
    compsky::mysql::query_buffer(_mysql::obj,  RES1,  "SELECT LAST_INSERT_ID() as ''");
    while (compsky::mysql::assign_next_row(RES1, &ROW1, &n));
    return n;
}

inline
uint64_t is_file_in_db(const char* fp){
	constexpr static const compsky::asciify::flag::Escape _f_esc;
    compsky::mysql::query(_mysql::obj,  RES1,  BUF,  "SELECT id FROM file WHERE name=\"", _f_esc, '"', fp, "\"");
    
    uint64_t id = 0;
    while(compsky::mysql::assign_next_row(RES1,  &ROW1,  &id));
    
    return id;
}


#endif
