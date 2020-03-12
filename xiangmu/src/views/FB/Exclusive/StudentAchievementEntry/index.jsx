

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { Form,Row,Col,Input,Table,Pagination,Button, message } from 'antd';
const FormItem = Form.Item;  
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import ContentBox from '@/components/ContentBox'; 
import { searchFormItemLayout,renderSearchTopButtons,renderSearchBottomButtons,onSearch,onToggleSearchOption,onPageIndexChange, onShowSizeChange, } from '@/utils/componentExt'; 
import { ResultInputList } from '@/actions/stuService';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import Result from './Result';
 
class ExclusiveUniformManagement extends React.Component {
        constructor(){
            super()
            this.onSearch = onSearch.bind(this);
            this.onPageIndexChange = onPageIndexChange.bind(this);
            this.onShowSizeChange = onShowSizeChange.bind(this);
            this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
            this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
            this.onToggleSearchOption = onToggleSearchOption.bind(this);
            this.state = { 
                pagingSearch:{
                    pageSize:10,
                    currentPage:1,
                    realName:'',
                    mobile:''
                }
            }
        }
        componentWillMount(){
            // this.onSearch();
        } 
            
        fetch = (params = {}) => { 
            var condition = params || this.state.pagingSearch;  
            if(!condition.realName && !condition.mobile)return message.warning('至少输入一个查询条件!');
            this.setState({ loading: true });
            this.props.ResultInputList(condition).payload.promise.then((response) => {
                let data = response.payload.data; 
                    if(data.state == 'success'){
                        this.setState({
                            data_list:data.data,
                            pagingSearch: condition,
                            totalRecord: data.totalRecord,
                        })
                    }else{
                        message.error(data.msg)
                    }
                    this.setState({
                        loading:false
                    })
                }
            ) 
        }
        columns = [
            {
                title:'教学点',
                fixed:'left',
                dataIndex:'teachCenterName', 
                width:'120'
            },
            {
                title:'学服姓名',
                dataIndex:'privateTeacherName', 
                width:'100', 
            }, 
            {
                title:'订单号',
                dataIndex:'orderSn', 
                width:'160', 
            }, 
            {
                title:'学服电话',
                dataIndex:'privateTeacherMobile', 
                width:'120', 
            },
            {
                title:'学生姓名',
                dataIndex:'realName', 
                width:'100',
                render: (text, record, index) => {
                    return <span>
                        <a href="javascript:;" onClick={() => { this.onLookView('oldViewStudentDetail', record); }}>{text}</a>
                    </span>
                }
            },
            {
                title:'入学年份',
                dataIndex:'studyUniversityEnterYear', 
                width:'100'
            },
            {
                title:'就读高校',
                dataIndex:'universityName', 
                width:'100'
            },
            {
                title:'订单项目',
                dataIndex:'itemName',  
            }, 
            {
                title:'性别',
                dataIndex:'gender', 
                width:'60'
            },
            {
                title:'证件号码',
                dataIndex:'certificateNo', 
                width:'160'
            },
            {
                title:'手机号', 
                dataIndex:'mobile', 
                width:'120'
            },
            {
                title:'操作',
                fixed:'right',
                dataIndex:'', 
                width:'120',
                render:(text,record)=>{
                    return <Button onClick={()=>this.onLookView('Result',record)}>录入成绩</Button>
                }
            }
        ]  
        //浏览视图
        onLookView = (op, item) => {
            this.setState({
                editMode: op,//编辑模式
                currentDataModel: item,//编辑对象
            });
    
        };
        //视图回调
        onViewCallback = (dataModel) => {
            if (!dataModel) {
                this.setState({ currentDataModel: null, editMode: 'Manage' })
            }else{
                
                this.setState({ currentDataModel: null, editMode: 'Manage' })
                this.onSearch();
            }
        }
        render(){

            const { getFieldDecorator } = this.props.form;
            let black_content = <div></div>;
            switch(this.state.editMode){
                case 'oldViewStudentDetail':
                    black_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
                    break;
                case 'Result':
                    black_content = <Result  viewCallback={this.onViewCallback} {...this.state}/>
                break;
                default: 
                    black_content = (<div>
                        <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons()}>
                            {!this.state.seachOptionsCollapsed && 
                                <Form
                                    className='search-form'
                                >
                                    <Row gutter = {24} type='flex'>      
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'学生姓名'}
                                            >
                                                {getFieldDecorator('realName',{initialValue:this.state.pagingSearch.realName})(
                                                    <Input placeholder='请输入学生姓名' />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label={'手机号'}
                                            >
                                                {getFieldDecorator('mobile',{initialValue:this.state.pagingSearch.mobile})(
                                                    <Input placeholder='请输入手机号' />
                                                )}
                                            </FormItem>
                                        </Col>
                                    </Row>
                                </Form>
                            }
                        </ContentBox>
                        <div className='space-default'></div>
                        <div className='search-result-list'>
                            <Table 
                                columns = {this.columns}
                                loading = {this.state.loading}
                                pagination = {false}
                                dataSource = {this.state.data_list}
                                bordered
                                rowKey={record=>record.studentPayfeeId}
                                scroll={{x:1600}}
                                rowClassName={record=>record.zbPayeeTypeIsEquals == false?'highLight_column':''}
                            />
                            <div className='space-default'></div>
                            <div calssName='search-paging'>
                                <Row justify="space-between" align="middle" type="flex"> 
                                </Row>
                                <Row justify="end" align="middle" type="flex">
                                    <Col span={24} className='search-paging-control'>
                                        <Pagination 
                                            showSizeChanger
                                            current = {this.state.pagingSearch.currentPage}
                                            defaultPageSize = {this.state.pagingSearch.pageSize}
                                            pageSize = {this.state.pagingSearch.pageSize}
                                            onShowSizeChange = {this.onShowSizeChange}
                                            onChange = {this.onPageIndexChange}
                                            showTotal = {(total)=>{ return `共${total}条数据`;}}
                                            total = {this.state.totalRecord}
                                            pageSizeOptions = {['10','20','30','50','100','200']}
                                        /> 
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>)
                break;
            }
            return black_content; 
        }
}


const WrappedManage = Form.create()(ExclusiveUniformManagement);
const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
}

function mapDispatchToProps(dispatch){
    return {
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        ResultInputList: bindActionCreators(ResultInputList, dispatch),
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(WrappedManage);