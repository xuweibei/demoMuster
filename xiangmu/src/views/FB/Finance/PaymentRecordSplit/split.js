
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    Modal, Form, Row, Col, Input, Select, Button, Icon,
    Table, Pagination, Card, Radio, message, Checkbox, Cascader,DatePicker,InputNumber 
} from 'antd';
const FormItem = Form.Item;

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
import { loadBizDictionary, searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, split, formatMoney, timestampToTime, convertTextToHtml,formatMoment } from '@/utils';

import { loadDictionary } from '@/actions/dic';
import { splitByStudentPayfee } from '@/actions/finance';
import NumericInput from '@/components/NumericInput';
//订单详情
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

class PaymentRecordSplitEdit extends React.Component {
    constructor(props) {
        super(props)
        this.loadBizDictionary = loadBizDictionary.bind(this);
        
        let timeArr = timestampToTime(new Date().getTime()).split('-');
        let startTimeYear = timeArr[0];
        let startTimeMonth = timeArr[1];
        let startTimeDay = timeArr[2];

        this.state = {
            confirmDate:startTimeYear+'-'+startTimeMonth+'-'+startTimeDay,
            endOpen:false,
            dataModel:
            { ...props.currentDataModel, stageList: [] },
            inputCount: 2,
            splitData: []
        };
    }
    componentWillMount() {

    }
    onCancel = () => {
        this.props.viewCallback();
    }

    onSubmit = () => {
        var that = this;
        let updateData = [], totleSplitMoney = 0;
        for(var i=0;i<this.state.splitData.length;i++){
            if(!this.state.splitData[i].money){
                message.error('拆分金额不能为空！');
                return null;
            }
            if(!this.state.splitData[i].date){
                message.error('缴费日期不能为空！');
                return null;
            }
            totleSplitMoney += parseFloat(this.state.splitData[i].money);
            updateData.push({
                money:this.state.splitData[i].money,
                payDate: formatMoment(this.state.splitData[i].date,dateFormat),
            });
        }

        totleSplitMoney = Math.round(totleSplitMoney*100)/100;
        
        if(totleSplitMoney > this.state.dataModel.money){
            message.error('拆分总金额不能大于缴费金额！');
            return null;
        }else if(totleSplitMoney < this.state.dataModel.money){
            message.error('拆分总金额不能小于缴费金额！');
            return null;
        }
        
        that.setState({ loading: true });
        
        this.props.splitByStudentPayfee({ payfeeId: this.props.currentDataModel.studentPayfeeId,updateData:JSON.stringify(updateData) }).payload.promise.then((response) => {
            let data = response.payload.data;
            that.setState({ loading: false });
            if (data.state === 'success') {
                message.success('拆分成功！');
                this.props.viewCallback(this.props.currentDataModel);
            }else{
                message.error(data.message);
                return;
            }
        });
            

    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `缴费记录拆分`;
    }

    columns = [
        {
          title: '记录',
          render: (text, record, index) => {
            return <span>第{index+1}条记录</span>
          }
        },
        {
            title: '缴费金额',
            dataIndex: 'money',
            render: (text, record, index) => {
                return <NumericInput value={record.money} onChange={(value) => {this.onSplitNumberChange(value,index)}} />
            }
        },
        {
            title: '缴费日期',
            dataIndex: 'date',
            render: (text, record, index) => {
                return <DatePicker  style={{ width: '180px' }} format={dateFormat} onChange={(value) => this.onDateChange(value, index)} />
            }
        },
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
        }
    }
    //表单按钮处理
    renderBtnControl() {
        
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
            {
                this.state.splitData.length ? <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>确认拆分</Button>
                :
                <Button type="primary" disabled loading={this.state.loading} icon="save" onClick={this.onSubmit}>确认拆分</Button>
            }
            
            <span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
        </FormItem>
        
    }
    onChangeNum = (value) => {
        this.setState({ inputCount: value })
    }
    saveInput = () => {
        let splitData = [];
        for(var i=0;i<this.state.inputCount;i++){
            let itemData = {};
            itemData.money = 0;
            itemData.date = '';
            splitData.push(itemData)
        }
        this.setState({
            splitData: splitData
        })
    }
    onSplitNumberChange = (value,index) => {
        this.state.splitData[index].money = value;
        this.setState({
            splitData: this.state.splitData
        })
    }
    onDateChange = (value,index) => {
        this.state.splitData[index].date = value;
        this.setState({
            splitData: this.state.splitData
        })
    }
    render() {
        let title = this.getTitle();
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;

        switch (this.props.editMode) {
            case "View":
            case "Confirm":
            case "Edit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout} label="当前缴费金额（¥）">
                                    {formatMoney(this.state.dataModel.money)}
                                </FormItem>
                                <FormItem {...searchFormItemLayout} label="缴费记录拆分个数">
                                    <InputNumber style={{ width: '120px' }} min={2} defaultValue={2} onChange={this.onChangeNum} />
                                    <span className="split_button"></span>
                                    <Button onClick={() => {
                                        this.saveInput()
                                    }} icon="save">确定</Button>
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <div style={{width:'90%',margin:'0 auto'}}>
                                { this.state.splitData.length ? <Table columns={this.columns} //列定义
                                        loading={this.state.loading}
                                        pagination={false}
                                        dataSource={this.state.splitData}//数据
                                        bordered
                                        //scroll={{ x: 900 }}
                                    />
                                    : ''
                                }
                            </div>
                        </Row>
                        {/* {
                            this.state.splitData.map((item,index) => {
                                return <Row gutter={24}>
                                            <Col span={12}>
                                                <FormItem {...searchFormItemLayout} label={`第${index+1}条记录金额`}>
                                                    <NumericInput value={item.money} onChange={(value) => {this.onSplitNumberChange(value,index)}} />
                                                </FormItem>
                                            </Col>
                                            <Col span={12}>
                                                <FormItem {...searchFormItemLayout} label="缴费日期">
                                                    <DatePicker format={dateFormat} onChange={(value) => this.onDateChange(value, index)} />
                                                </FormItem>
                                            </Col>
                                        </Row>
                            })
                        } */}
                    </Form>
                );
                break;
        }

        return (
            <div>
                <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_content}
                    <div className="dv_split"></div>
                </ContentBox>
                
            </div>
        );
    }

}

//表单组件 封装
const WrappedManage = Form.create()(PaymentRecordSplitEdit);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        splitByStudentPayfee: bindActionCreators(splitByStudentPayfee, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
